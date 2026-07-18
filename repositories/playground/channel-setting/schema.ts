// In scope: ChannelSetting の Discord ID と JSON configuration を検証する
// Out of scope: DB 操作、Discord ID の発見、settingKey の解釈
import { z } from "zod";

/** Discord Snowflake 文字列の schema。 */
export const discordSnowflakeSchema = z.string().regex(/^[0-9]{1,20}$/);

/** ChannelSetting の JSONB configuration schema。 */
export const channelSettingConfigurationSchema = z
	.object({
		version: z.literal(1),
		channelId: discordSnowflakeSchema,
	})
	.strict();
