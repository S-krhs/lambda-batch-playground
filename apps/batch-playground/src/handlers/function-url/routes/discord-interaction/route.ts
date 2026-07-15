// In scope: request の parse、認証・認可、operation の振り分け、response の形成
// Out of scope: 署名検証アルゴリズム、type別operation内のオーケストレーション、メッセージ生成
import { createBatchLogger } from "@eskra-aws-playground/libs/logger/batch-logger.js";
import { Resource } from "sst/resource";

import {
	buildInteractionResponse,
	DISCORD_INTERACTION_TYPES,
	type DiscordInteractionResponsePayload,
	parseInteraction,
} from "../../../../external-protocols/discord/discord-message.js";
import { verifyInteractionSignature } from "../../../../external-protocols/discord/verify-interaction-signature.js";
import type { FunctionUrlEvent, FunctionUrlResponse } from "../../schema.js";
import { messageComponentOperation } from "./operations/message-component-operation.js";
import { discordInteractionRequestSchema } from "./schema.js";

const logger = createBatchLogger("discord-interaction");

const discordResponse = (
	payload: DiscordInteractionResponsePayload,
): FunctionUrlResponse => {
	return {
		statusCode: 200,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	};
};

/** Discord interactions endpoint の route。 */
export const discordInteractionRoute = async (
	event: FunctionUrlEvent,
): Promise<FunctionUrlResponse> => {
	// 1. request を route 固有の入力へ parse する。
	logger.start();
	const parsedRequest = discordInteractionRequestSchema.safeParse(event);
	if (!parsedRequest.success) {
		logger.failure(new Error("Function URL request の形式が不正です。"));
		return {
			statusCode: 400,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "リクエストが不正です。" }),
		};
	}

	const { signature, timestamp, rawBody } = parsedRequest.data;
	const interaction = parseInteraction(rawBody);
	if (!interaction) {
		logger.failure(new Error("interaction body の形式が不正です。"));
		return {
			statusCode: 400,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "リクエストが不正です。" }),
		};
	}

	// 2. parse 済み request を認証・認可する。
	const publicKey = Resource.DiscordInteractionPublicKey.value;
	if (
		!verifyInteractionSignature({
			publicKey,
			signature,
			timestamp,
			rawBody,
		})
	) {
		logger.failure(new Error("interaction の署名検証に失敗しました。"));
		return {
			statusCode: 401,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "署名が不正です。" }),
		};
	}

	// 3. interaction の内容に応じて実行する operation を振り分ける。
	const result =
		interaction.type === DISCORD_INTERACTION_TYPES.MESSAGE_COMPONENT
			? messageComponentOperation(interaction)
			: undefined;
	logger.complete({ interactionType: interaction.type });

	// 4. Discord response bodyからFunction URL responseを形成する。
	switch (result?.kind) {
		case "update-message":
		case "ephemeral":
			return discordResponse(buildInteractionResponse(result));
	}

	switch (interaction.type) {
		case DISCORD_INTERACTION_TYPES.PING:
			return discordResponse(buildInteractionResponse({ kind: "pong" }));
		case DISCORD_INTERACTION_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE:
			return discordResponse(
				buildInteractionResponse({ kind: "empty-autocomplete" }),
			);
		default:
			return discordResponse(
				buildInteractionResponse({
					kind: "ephemeral",
					content: "この操作には対応していません。",
				}),
			);
	}
};
