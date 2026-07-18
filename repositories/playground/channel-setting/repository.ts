// In scope: applicationKey・settingKey・guildId・userId で識別する ChannelSetting の保存・削除・取得
// Out of scope: Discord ID の発見、権限検証、settingKey の解釈、routing
import { getPrismaClient } from "../../db/client.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
	channelSettingConfigurationSchema,
	discordSnowflakeSchema,
} from "./schema.js";
import type {
	ChannelSetting,
	DeleteChannelSettingInput,
	FindChannelSettingsInput,
	SaveChannelSettingInput,
} from "./types.js";

interface ChannelSettingRow {
	guildId: string;
	userId: string;
	configuration: unknown;
}

const channelSettingSelect = {
	guildId: true,
	userId: true,
	configuration: true,
} as const;

const toChannelSetting = (row: ChannelSettingRow): ChannelSetting => {
	const configuration = channelSettingConfigurationSchema.parse(
		row.configuration,
	);
	return {
		guildId: discordSnowflakeSchema.parse(row.guildId),
		channelId: configuration.channelId,
		userId: discordSnowflakeSchema.parse(row.userId),
	};
};

/** Discord チャンネル設定の永続化操作。 */
export const channelSettingRepository = {
	/** Guild・対象利用者のチャンネル設定を保存し、保存後の設定を返す。 */
	save: async (input: SaveChannelSettingInput): Promise<ChannelSetting> => {
		const configuration = channelSettingConfigurationSchema.parse({
			version: 1,
			channelId: input.channelId,
		});
		const guildId = discordSnowflakeSchema.parse(input.guildId);
		const userId = discordSnowflakeSchema.parse(input.userId);
		const prisma = getPrismaClient();
		const row = await prisma.discordUserSetting.upsert({
			where: {
				applicationKey_guildId_userId_settingKey: {
					applicationKey: input.applicationKey,
					guildId,
					userId,
					settingKey: input.settingKey,
				},
			},
			create: {
				applicationKey: input.applicationKey,
				guildId,
				userId,
				settingKey: input.settingKey,
				configuration,
			},
			update: { configuration },
			select: channelSettingSelect,
		});

		return toChannelSetting(row);
	},

	/** Guild・対象利用者のチャンネル設定を削除し、削除した設定を返す。対象がなければ null を返す。 */
	deleteByGuildIdAndUserId: async (
		input: DeleteChannelSettingInput,
	): Promise<ChannelSetting | null> => {
		const guildId = discordSnowflakeSchema.parse(input.guildId);
		const userId = discordSnowflakeSchema.parse(input.userId);
		const prisma = getPrismaClient();
		try {
			const row = await prisma.discordUserSetting.delete({
				where: {
					applicationKey_guildId_userId_settingKey: {
						applicationKey: input.applicationKey,
						guildId,
						userId,
						settingKey: input.settingKey,
					},
				},
				select: channelSettingSelect,
			});

			return toChannelSetting(row);
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				return null;
			}
			throw error;
		}
	},

	/** 登録済みのチャンネル設定を検証し、安定した順序で返す。 */
	findMany: async (
		input: FindChannelSettingsInput,
	): Promise<ChannelSetting[]> => {
		const prisma = getPrismaClient();
		const rows = await prisma.discordUserSetting.findMany({
			where: {
				applicationKey: input.applicationKey,
				settingKey: input.settingKey,
			},
			orderBy: [{ guildId: "asc" }, { userId: "asc" }],
			select: channelSettingSelect,
		});

		return rows.map(toChannelSetting);
	},
};
