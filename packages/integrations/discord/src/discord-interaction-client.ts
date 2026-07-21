// In scope: interaction token を使った deferred 応答の元メッセージ編集と follow-up message 投稿
// Out of scope: interaction の parse、token・application ID の解決、payload の構築、業務ルール
import {
	sanitizeText,
	type TextReplacement,
} from "@eskra-aws-playground/libs/string/text-sanitizer.js";
import type { DiscordActionRow } from "./discord-bot-client.js";
import { type JsonResponseDetails, sendJson } from "./internal/send-json.js";

/** Discord Interaction API 失敗応答の安全化済み詳細。 */
export type DiscordInteractionResponseDetails = JsonResponseDetails;

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const DISCORD_SNOWFLAKE_PATTERN = /^\d{1,20}$/;

/** interaction の応答として送るメッセージ payload。 */
export interface DiscordInteractionMessagePayload {
	content: string;
	/** 空配列を渡すと元メッセージのボタンを取り除ける。 */
	components?: readonly DiscordActionRow[];
	/** Discord message flag。呼び出し元だけに見せる場合に指定する。 */
	flags?: number;
	allowed_mentions: {
		parse: readonly string[];
		users?: readonly string[];
	};
}

/** Discord Interaction API のメッセージ送信時に上書きできるオプション。 */
export interface DiscordInteractionMessageOptions {
	timeoutMs?: number;
}

/** Discord Interaction API 連携で発生した失敗を表すエラー。 */
export class DiscordInteractionError extends Error {
	public readonly responseDetails: unknown | null;

	constructor(message: string, responseDetails: unknown | null = null) {
		super(message);
		this.name = "DiscordInteractionError";
		this.responseDetails = responseDetails;
	}
}

/**
 * deferred 応答済み interaction へのメッセージ送信を担当するクライアント。
 * interaction token 自体が認証情報のため Bot token を必要としない。token の有効期限は Discord 側の仕様で 15 分。
 */
export class DiscordInteractionClient {
	private readonly applicationId: string;
	private readonly interactionToken: string;
	private readonly defaultTimeoutMs = 10_000;

	constructor(applicationId: string, interactionToken: string) {
		const normalizedApplicationId = applicationId.trim();
		if (!DISCORD_SNOWFLAKE_PATTERN.test(normalizedApplicationId)) {
			throw new DiscordInteractionError(
				"Discord application ID は 1〜20 桁の数字からなる snowflake である必要があります",
			);
		}

		const normalizedInteractionToken = interactionToken.trim();
		if (normalizedInteractionToken === "") {
			throw new DiscordInteractionError("Discord interaction token が空です");
		}

		this.applicationId = normalizedApplicationId;
		this.interactionToken = normalizedInteractionToken;
	}

	/** deferred 応答で表示中のメッセージを、確定した内容へ差し替える。 */
	public async editOriginalResponse(
		payload: DiscordInteractionMessagePayload,
		options: DiscordInteractionMessageOptions = {},
	): Promise<void> {
		await this.send(
			"PATCH",
			`${this.webhookUrl()}/messages/@original`,
			payload,
			options,
		);
	}

	/** 元メッセージとは別に、同じ interaction へ追加のメッセージを送る。 */
	public async postFollowupMessage(
		payload: DiscordInteractionMessagePayload,
		options: DiscordInteractionMessageOptions = {},
	): Promise<void> {
		await this.send("POST", this.webhookUrl(), payload, options);
	}

	private async send(
		method: "POST" | "PATCH",
		url: string,
		payload: DiscordInteractionMessagePayload,
		options: DiscordInteractionMessageOptions,
	): Promise<void> {
		try {
			await sendJson({
				method,
				url,
				payload,
				timeoutMs: options.timeoutMs ?? this.defaultTimeoutMs,
				apiLabel: "Discord Interaction API",
				responseBodyReplacements: this.interactionTokenReplacements(),
				createError: (message, responseDetails) => {
					return new DiscordInteractionError(message, responseDetails);
				},
			});
		} catch (error) {
			throw this.sanitizeUnknownError(error);
		}
	}

	/** interaction token を含む webhook API の URL を組み立てる。 */
	private webhookUrl(): string {
		return `${DISCORD_API_BASE_URL}/webhooks/${this.applicationId}/${this.interactionToken}`;
	}

	/** interaction token を秘匿するための置換ルール。 */
	private interactionTokenReplacements(): readonly TextReplacement[] {
		return [
			{
				pattern: this.interactionToken,
				replacement: "[redacted-discord-interaction-token]",
			},
		];
	}

	/** fetch が投げた例外のメッセージから interaction token を除去して返す。 */
	private sanitizeUnknownError(error: unknown): unknown {
		if (
			error instanceof Error &&
			error.message.includes(this.interactionToken)
		) {
			return new DiscordInteractionError(
				sanitizeText(error.message, {
					replacements: this.interactionTokenReplacements(),
				}),
			);
		}

		return error;
	}
}
