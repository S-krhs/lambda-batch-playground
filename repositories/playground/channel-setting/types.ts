// In scope: ChannelSetting repository の入出力型
// Out of scope: validation schema、DB 操作、settingKey の解釈
import type { ApplicationKey } from "../shared/literals/application-key.js";
import type { SettingKey } from "../shared/literals/setting-key.js";

/** Guild・対象利用者ごとの Discord チャンネル設定。 */
export interface ChannelSetting {
	guildId: string;
	channelId: string;
	userId: string;
}

/** Discord チャンネル設定の保存入力。 */
export interface SaveChannelSettingInput {
	applicationKey: ApplicationKey;
	settingKey: SettingKey;
	guildId: string;
	channelId: string;
	userId: string;
}

/** Discord チャンネル設定の削除入力。 */
export interface DeleteChannelSettingInput {
	applicationKey: ApplicationKey;
	settingKey: SettingKey;
	guildId: string;
	userId: string;
}

/** Discord チャンネル設定の取得入力。 */
export interface FindChannelSettingsInput {
	applicationKey: ApplicationKey;
	settingKey: SettingKey;
}
