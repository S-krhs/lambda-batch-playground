// In scope: Bot token を使って Discord API のチャンネルへメッセージを投稿する
// Out of scope: Bot token の解決、メッセージ内容の生成、interaction の応答処理
import { sanitizeText } from "@eskra-aws-playground/libs/string/text-sanitizer.js";

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const DISCORD_CHANNEL_ID_PATTERN = /^\d+$/;

/** Discord メッセージのボタンコンポーネント。 */
export interface DiscordButtonComponent {
	type: 2;
	style: 1 | 2 | 3 | 4;
	label: string;
	custom_id: string;
}

/** ボタンを並べる action row コンポーネント。 */
export interface DiscordActionRow {
	type: 1;
	components: readonly DiscordButtonComponent[];
}

/** Bot がチャンネルへ送るメッセージ payload。 */
export interface DiscordChannelMessagePayload {
	content: string;
	components?: readonly DiscordActionRow[];
	allowed_mentions: {
		parse: readonly string[];
		users?: readonly string[];
	};
}

/** Discord Bot API のメッセージ投稿時に上書きできるオプション。 */
export interface DiscordBotMessageOptions {
	timeoutMs?: number;
}

/** Discord Bot API 失敗応答の安全化済み詳細。 */
export interface DiscordBotResponseDetails {
	status: number;
	body: string;
}

/** Discord Bot API 連携で発生した失敗を表すエラー。 */
export class DiscordBotError extends Error {
	public readonly responseDetails: unknown | null;

	constructor(message: string, responseDetails: unknown | null = null) {
		super(message);
		this.name = "DiscordBotError";
		this.responseDetails = responseDetails;
	}
}

/** Discord Bot API へのメッセージ投稿を担当するクライアント。 */
export class DiscordBotClient {
	private readonly botToken: string;
	private readonly defaultTimeoutMs = 10_000;

	constructor(botToken: string) {
		this.botToken = validateDiscordBotToken(botToken);
	}

	/** チャンネルへメッセージを投稿する。 */
	public async postChannelMessage(
		channelId: string,
		payload: DiscordChannelMessagePayload,
		options: DiscordBotMessageOptions = {},
	): Promise<void> {
		const normalizedChannelId = channelId.trim();
		if (!DISCORD_CHANNEL_ID_PATTERN.test(normalizedChannelId)) {
			throw new DiscordBotError(
				"Discord channel ID は数字のみの snowflake である必要があります",
			);
		}

		if (typeof globalThis.fetch !== "function") {
			throw new DiscordBotError("ランタイムに fetch がありません");
		}

		const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
		}, timeoutMs);

		let response: Response;
		try {
			response = await fetch(
				`${DISCORD_API_BASE_URL}/channels/${normalizedChannelId}/messages`,
				{
					method: "POST",
					headers: {
						Authorization: `Bot ${this.botToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
					signal: controller.signal,
				},
			);
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				throw new DiscordBotError(
					`Discord Bot API リクエストがタイムアウトしました: ${timeoutMs}ms`,
					{
						timeoutMs,
					},
				);
			}

			throw this.sanitizeUnknownError(error);
		} finally {
			clearTimeout(timeoutId);
		}

		if (!response.ok) {
			const text = await response.text();
			const responseDetails: DiscordBotResponseDetails = {
				status: response.status,
				body: sanitizeText(text, {
					replacements: [
						{
							pattern: this.botToken,
							replacement: "[redacted-discord-bot-token]",
						},
					],
				}),
			};

			throw new DiscordBotError(
				`Discord Bot API 応答が失敗しました: ${response.status}`,
				responseDetails,
			);
		}
	}

	/** fetch が投げた例外のメッセージから bot token を除去して返す。 */
	private sanitizeUnknownError(error: unknown): unknown {
		if (error instanceof Error && error.message.includes(this.botToken)) {
			return new DiscordBotError(
				sanitizeText(error.message, {
					replacements: [
						{
							pattern: this.botToken,
							replacement: "[redacted-discord-bot-token]",
						},
					],
				}),
			);
		}

		return error;
	}
}

const validateDiscordBotToken = (botToken: string): string => {
	const normalizedBotToken = botToken.trim();
	if (normalizedBotToken === "") {
		throw new DiscordBotError("Discord Bot token が空です");
	}

	return normalizedBotToken;
};
