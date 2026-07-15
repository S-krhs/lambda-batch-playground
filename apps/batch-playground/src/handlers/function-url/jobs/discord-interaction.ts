// In scope: Discord interaction の署名検証・body 解釈・応答 payload 作成をオーケストレーションし、成功/失敗の結果を返す
// Out of scope: Function URL envelope の検証、HTTP status・レスポンスの組み立て、署名検証アルゴリズムや選択結果判定の詳細を持つ
import { verifyInteractionSignature } from "@eskra-aws-playground/integration-discord/interaction-signature-verifier.js";
import { createBatchLogger } from "@eskra-aws-playground/libs/logger/batch-logger.js";
import { Resource } from "sst/resource";

import { resolveComponentInteraction } from "../routes.js";
import {
	discordInteractionSchema,
	type FunctionUrlEvent,
	type FunctionUrlJobResult,
} from "../schema.js";

const logger = createBatchLogger("discord-interaction");

const INTERACTION_TYPE_PING = 1;
const INTERACTION_TYPE_MESSAGE_COMPONENT = 3;
const INTERACTION_TYPE_AUTOCOMPLETE = 4;
const RESPONSE_TYPE_PONG = 1;
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4;
const RESPONSE_TYPE_UPDATE_MESSAGE = 7;
const RESPONSE_TYPE_AUTOCOMPLETE_RESULT = 8;
const MESSAGE_FLAG_EPHEMERAL = 64;

const UNSUPPORTED_INTERACTION_CONTENT = "この操作には対応していません。";

/** Discord へ返す応答 payload を成功結果に包む。 */
const success = (body: unknown): FunctionUrlJobResult => {
	return { ok: true, body };
};

/** 本人にだけ見える ephemeral メッセージの成功結果を作る。 */
const ephemeral = (content: string): FunctionUrlJobResult => {
	return success({
		type: RESPONSE_TYPE_CHANNEL_MESSAGE,
		data: {
			content,
			flags: MESSAGE_FLAG_EPHEMERAL,
			allowed_mentions: { parse: [] },
		},
	});
};

/** ボタン押下 interaction を routing へ委譲し、応答内容を Discord 応答へ変換する。 */
const handleMessageComponent = (
	customId: string | undefined,
	pressedUserId: string | undefined,
): FunctionUrlJobResult => {
	const reply =
		customId && pressedUserId
			? resolveComponentInteraction(customId, pressedUserId)
			: { kind: "unsupported" as const };

	switch (reply.kind) {
		case "update-message":
			// 元メッセージを選択結果の表示へ更新し、ボタンを取り除く。
			return success({
				type: RESPONSE_TYPE_UPDATE_MESSAGE,
				data: {
					content: reply.content,
					components: [],
					allowed_mentions: { parse: [] },
				},
			});
		case "ephemeral":
			return ephemeral(reply.content);
		case "unsupported":
			return ephemeral(UNSUPPORTED_INTERACTION_CONTENT);
	}
};

/** 署名検証済みの Function URL イベントから interaction を解釈し、成功/失敗の結果を返すジョブ。 */
export const discordInteractionJob = async (
	event: FunctionUrlEvent,
): Promise<FunctionUrlJobResult> => {
	// 1. SST link から Discord application の public key を解決する。
	const discordInteractionPublicKey =
		Resource.DiscordInteractionPublicKey.value;

	logger.start();

	// 2. 署名ヘッダーと raw body を取り出す。
	const { headers, body, isBase64Encoded } = event;
	const signature = headers["x-signature-ed25519"] ?? "";
	const timestamp = headers["x-signature-timestamp"] ?? "";
	const rawBody = isBase64Encoded
		? Buffer.from(body ?? "", "base64").toString("utf8")
		: (body ?? "");

	// 3. Ed25519 署名を検証する。失敗した interaction は処理しない。
	const signatureValid = verifyInteractionSignature({
		publicKey: discordInteractionPublicKey,
		signature,
		timestamp,
		rawBody,
	});

	if (!signatureValid) {
		logger.failure(new Error("interaction の署名検証に失敗しました。"));
		return { ok: false, error: "unauthorized" };
	}

	// 4. raw body を JSON パースし、interaction schema で検証する。
	let parsedBody: unknown;
	try {
		parsedBody = JSON.parse(rawBody);
	} catch {
		logger.failure(
			new Error("interaction body の JSON パースに失敗しました。"),
		);
		return { ok: false, error: "invalid-request" };
	}

	const parsedInteraction = discordInteractionSchema.safeParse(parsedBody);

	if (!parsedInteraction.success) {
		logger.failure(new Error("interaction body の形式が不正です。"));
		return { ok: false, error: "invalid-request" };
	}

	const interaction = parsedInteraction.data;

	// 5. PING には PONG を返す(Discord の Interactions Endpoint URL 検証で使われる)。
	if (interaction.type === INTERACTION_TYPE_PING) {
		logger.complete({ interactionType: interaction.type });
		return success({ type: RESPONSE_TYPE_PONG });
	}

	// 6. ボタン押下は custom_id の prefix から担当 feature を解決し、応答へ変換する。
	if (interaction.type === INTERACTION_TYPE_MESSAGE_COMPONENT) {
		const result = handleMessageComponent(
			interaction.data?.custom_id,
			interaction.member?.user?.id ?? interaction.user?.id,
		);
		logger.complete({ interactionType: interaction.type });
		return result;
	}

	// 7. autocomplete にはメッセージ応答が許されないため、空の候補一覧を返す。
	if (interaction.type === INTERACTION_TYPE_AUTOCOMPLETE) {
		logger.complete({ interactionType: interaction.type });
		return success({
			type: RESPONSE_TYPE_AUTOCOMPLETE_RESULT,
			data: { choices: [] },
		});
	}

	// 8. 対応していない interaction 種別は ephemeral で対応外を返す。
	logger.complete({ interactionType: interaction.type });
	return ephemeral(UNSUPPORTED_INTERACTION_CONTENT);
};
