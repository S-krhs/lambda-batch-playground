// In scope: Guild・対象利用者ごとの play-check reminder 配信設定の保存、削除、取得と JSON configuration の検証
// Out of scope: Discord ID の発見、権限検証、リマインダー送信、他 setting の解釈
import { getPrismaClient } from "../../db/client.js";
import {
	discordSnowflakeSchema,
	playCheckReminderConfigurationSchema,
	playCheckReminderSettingRowSchema,
} from "./schema.js";
import type {
	PlayCheckReminderConfig,
	SavePlayCheckReminderConfigInput,
} from "./type.js";

const APPLICATION_KEY = "yaccho-bot";
const SETTING_KEY = "play-check-reminder";

type DiscordUserSettingRow = {
	guildId: string;
	userId: string;
	configuration: unknown;
};

const settingSelect = {
	guildId: true,
	userId: true,
	configuration: true,
} as const;

const toPlayCheckReminderConfig = (
	row: DiscordUserSettingRow,
): PlayCheckReminderConfig => {
	const parsed = playCheckReminderSettingRowSchema.parse(row);
	return {
		guildId: parsed.guildId,
		channelId: parsed.configuration.channelId,
		userId: parsed.userId,
	};
};

/** play-check reminder 配信設定の永続化操作。 */
export const playCheckReminderConfigRepository = {
	/** Guild・対象利用者の設定を保存する。同じ対象利用者の設定があれば上書きする。 */
	save: async (input: SavePlayCheckReminderConfigInput): Promise<void> => {
		const configuration = playCheckReminderConfigurationSchema.parse({
			version: 1,
			channelId: input.channelId,
		});
		const guildId = discordSnowflakeSchema.parse(input.guildId);
		const userId = discordSnowflakeSchema.parse(input.userId);
		const prisma = getPrismaClient();
		await prisma.discordUserSetting.upsert({
			where: {
				applicationKey_guildId_userId_settingKey: {
					applicationKey: APPLICATION_KEY,
					guildId,
					userId,
					settingKey: SETTING_KEY,
				},
			},
			create: {
				applicationKey: APPLICATION_KEY,
				guildId,
				userId,
				settingKey: SETTING_KEY,
				configuration,
			},
			update: { configuration },
		});
	},

	/** Guild・対象利用者の設定を削除し、削除対象が存在したかを返す。 */
	deleteByGuildIdAndUserId: async (
		guildId: string,
		userId: string,
	): Promise<boolean> => {
		const parsedGuildId = discordSnowflakeSchema.parse(guildId);
		const parsedUserId = discordSnowflakeSchema.parse(userId);
		const prisma = getPrismaClient();
		const result = await prisma.discordUserSetting.deleteMany({
			where: {
				applicationKey: APPLICATION_KEY,
				guildId: parsedGuildId,
				userId: parsedUserId,
				settingKey: SETTING_KEY,
			},
		});

		return result.count > 0;
	},

	/** 登録済みの Guild・対象利用者設定を検証し、安定した順序で返す。 */
	findMany: async (): Promise<PlayCheckReminderConfig[]> => {
		const prisma = getPrismaClient();
		const rows = await prisma.discordUserSetting.findMany({
			where: {
				applicationKey: APPLICATION_KEY,
				settingKey: SETTING_KEY,
			},
			orderBy: [{ guildId: "asc" }, { userId: "asc" }],
			select: settingSelect,
		});

		return rows.map(toPlayCheckReminderConfig);
	},
};
