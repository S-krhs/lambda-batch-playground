// In scope: Bot token を使った Discord application command の global・guild 一括登録(bulk overwrite)と現登録の取得
// Out of scope: Bot token の解決、コマンド定義の宣言、interaction の parse、業務ルール
import {
	sanitizeText,
	type TextReplacement,
} from "@eskra-aws-playground/libs/string/text-sanitizer.js";
import { fetchJson } from "./internal/fetch-json.js";
import { type JsonResponseDetails, sendJson } from "./internal/send-json.js";

/** Discord Command API 失敗応答の安全化済み詳細。 */
export type DiscordCommandResponseDetails = JsonResponseDetails;

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const DISCORD_SNOWFLAKE_PATTERN = /^\d{1,20}$/;

/** Discord application command(スラッシュコマンド)の登録定義。 */
export interface DiscordCommandDefinition {
	name: string;
	description: string;
	options?: readonly DiscordCommandOptionDefinition[];
	default_member_permissions?: string;
	integration_types?: readonly (0 | 1)[];
	contexts?: readonly (0 | 1 | 2)[];
}

/** Discord application command option の登録定義。 */
export interface DiscordCommandOptionDefinition {
	type: number;
	name: string;
	description: string;
	required?: boolean;
	options?: readonly DiscordCommandOptionDefinition[];
}

/** Discord に登録済みの application command(表示に使う主要フィールド)。 */
export interface DiscordRegisteredCommand {
	id: string;
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

	/** application の global command 一覧を定義どおりに一括置換する。 */
	public async overwriteGlobalCommands(
		applicationId: string,
		commands: readonly DiscordCommandDefinition[],
		options: DiscordCommandOptions = {},
	): Promise<void> {
		const commandsUrl = this.globalCommandsUrl(applicationId);

		try {
			await sendJson({
				method: "PUT",
				url: commandsUrl,
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

	/** application に現在登録されている global command 一覧を取得する。 */
	public async getGlobalCommands(
		applicationId: string,
		options: DiscordCommandOptions = {},
	): Promise<readonly DiscordRegisteredCommand[]> {
		const commandsUrl = this.globalCommandsUrl(applicationId);

		try {
			return await fetchJson<readonly DiscordRegisteredCommand[]>({
				url: commandsUrl,
				headers: {
					Authorization: `Bot ${this.botToken}`,
				},
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
		const commandsUrl = this.guildCommandsUrl(applicationId, guildId);

		try {
			await sendJson({
				method: "PUT",
				url: commandsUrl,
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

	/** guild に現在登録されている application command 一覧を取得する(read-only)。 */
	public async getGuildCommands(
		applicationId: string,
		guildId: string,
		options: DiscordCommandOptions = {},
	): Promise<readonly DiscordRegisteredCommand[]> {
		const commandsUrl = this.guildCommandsUrl(applicationId, guildId);

		try {
			return await fetchJson<readonly DiscordRegisteredCommand[]>({
				url: commandsUrl,
				headers: {
					Authorization: `Bot ${this.botToken}`,
				},
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

	/** guild コマンド API の URL を組み立てる。ID は数字のみの snowflake であることを検証する。 */
	private guildCommandsUrl(applicationId: string, guildId: string): string {
		const normalizedApplicationId = this.validateSnowflake(
			applicationId,
			"Discord application ID",
		);
		const normalizedGuildId = this.validateSnowflake(
			guildId,
			"Discord guild ID",
		);

		return `${DISCORD_API_BASE_URL}/applications/${normalizedApplicationId}/guilds/${normalizedGuildId}/commands`;
	}

	/** application の global command API URL を返す。 */
	private globalCommandsUrl(applicationId: string): string {
		const normalizedApplicationId = this.validateSnowflake(
			applicationId,
			"Discord application ID",
		);
		return `${DISCORD_API_BASE_URL}/applications/${normalizedApplicationId}/commands`;
	}

	private validateSnowflake(value: string, label: string): string {
		const normalizedValue = value.trim();
		if (!DISCORD_SNOWFLAKE_PATTERN.test(normalizedValue)) {
			throw new DiscordCommandError(
				`${label} は 1〜20 桁の数字からなる snowflake である必要があります`,
			);
		}
		return normalizedValue;
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
