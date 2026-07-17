// In scope: Bot token を使った Discord application command の guild への一括登録(bulk overwrite)
// Out of scope: Bot token の解決、コマンド定義の宣言、interaction の parse、業務ルール
import {
	sanitizeText,
	type TextReplacement,
} from "@eskra-aws-playground/libs/string/text-sanitizer.js";
import { type JsonResponseDetails, sendJson } from "./internal/send-json.js";

/** Discord Command API 失敗応答の安全化済み詳細。 */
export type DiscordCommandResponseDetails = JsonResponseDetails;

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const DISCORD_SNOWFLAKE_PATTERN = /^\d+$/;

/** Discord application command(スラッシュコマンド)の登録定義。 */
export interface DiscordCommandDefinition {
	name: string;
	description: string;
}

/** Discord application command の登録時に上書きできるオプション。 */
export interface DiscordCommandOptions {
	timeoutMs?: number;
}

/** Discord Command API 連携で発生した失敗を表すエラー。 */
export class DiscordCommandError extends Error {
	public readonly responseDetails: unknown | null;

	constructor(message: string, responseDetails: unknown | null = null) {
		super(message);
		this.name = "DiscordCommandError";
		this.responseDetails = responseDetails;
	}
}

/** Discord application command の登録を担当するクライアント。 */
export class DiscordCommandClient {
	private readonly botToken: string;
	private readonly defaultTimeoutMs = 10_000;

	constructor(botToken: string) {
		this.botToken = validateDiscordBotToken(botToken);
	}

	/**
	 * guild のコマンド一覧を定義どおりに一括置換する。
	 * 定義に無いコマンドは Discord 側から削除されるため、宣言とコマンドが常に一致する。
	 */
	public async overwriteGuildCommands(
		applicationId: string,
		guildId: string,
		commands: readonly DiscordCommandDefinition[],
		options: DiscordCommandOptions = {},
	): Promise<void> {
		const normalizedApplicationId = applicationId.trim();
		const normalizedGuildId = guildId.trim();
		if (!DISCORD_SNOWFLAKE_PATTERN.test(normalizedApplicationId)) {
			throw new DiscordCommandError(
				"Discord application ID は数字のみの snowflake である必要があります",
			);
		}
		if (!DISCORD_SNOWFLAKE_PATTERN.test(normalizedGuildId)) {
			throw new DiscordCommandError(
				"Discord guild ID は数字のみの snowflake である必要があります",
			);
		}

		try {
			await sendJson({
				method: "PUT",
				url: `${DISCORD_API_BASE_URL}/applications/${normalizedApplicationId}/guilds/${normalizedGuildId}/commands`,
				headers: {
					Authorization: `Bot ${this.botToken}`,
				},
				payload: commands,
				timeoutMs: options.timeoutMs ?? this.defaultTimeoutMs,
				apiLabel: "Discord Command API",
				responseBodyReplacements: this.botTokenReplacements(),
				createError: (message, responseDetails) => {
					return new DiscordCommandError(message, responseDetails);
				},
			});
		} catch (error) {
			throw this.sanitizeUnknownError(error);
		}
	}

	/** bot token を秘匿するための置換ルール。 */
	private botTokenReplacements(): readonly TextReplacement[] {
		return [
			{
				pattern: this.botToken,
				replacement: "[redacted-discord-bot-token]",
			},
		];
	}

	/** fetch が投げた例外のメッセージから bot token を除去して返す。 */
	private sanitizeUnknownError(error: unknown): unknown {
		if (error instanceof Error && error.message.includes(this.botToken)) {
			return new DiscordCommandError(
				sanitizeText(error.message, {
					replacements: this.botTokenReplacements(),
				}),
			);
		}

		return error;
	}
}

const validateDiscordBotToken = (botToken: string): string => {
	const normalizedBotToken = botToken.trim();
	if (normalizedBotToken === "") {
		throw new DiscordCommandError("Discord Bot token が空です");
	}

	return normalizedBotToken;
};
