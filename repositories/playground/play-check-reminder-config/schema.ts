// In scope: play-check reminder 設定の Discord ID・JSON configuration・DB読取行の検証
// Out of scope: 公開型の定義、DB操作、設定値から配信内容への変換
import { z } from "zod";

/** Discord Snowflake 文字列の schema。 */
export const discordSnowflakeSchema = z.string().regex(/^[0-9]{1,20}$/);

/** play-check reminder の JSONB configuration schema。 */
export const playCheckReminderConfigurationSchema = z
	.object({
		version: z.literal(1),
		channelId: discordSnowflakeSchema,
	})
	.strict();

/** play-check reminder 設定として読み出す DB 行の schema。 */
export const playCheckReminderSettingRowSchema = z
	.object({
		guildId: discordSnowflakeSchema,
		userId: discordSnowflakeSchema,
		configuration: playCheckReminderConfigurationSchema,
	})
	.strict();
