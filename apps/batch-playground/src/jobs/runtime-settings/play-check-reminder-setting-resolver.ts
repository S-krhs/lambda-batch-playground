// In scope: 遊技チェックリマインダー job が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { requireSecret } from "./require-secret.js";

/** 遊技チェックリマインダー job が使う実行時設定。 */
export interface PlayCheckReminderSettings {
	discordBotToken: string;
	discordChannelId: string;
	targetUserId: string;
}

/** 遊技チェックリマインダー job が使う実行時設定を解決する。 */
export const getPlayCheckReminderSettings = (): PlayCheckReminderSettings => {
	return {
		discordBotToken: requireSecret("DiscordBotToken"),
		discordChannelId: requireSecret("PlayCheckReminderDiscordChannelId"),
		targetUserId: requireSecret("PlayCheckReminderTargetUserId"),
	};
};
