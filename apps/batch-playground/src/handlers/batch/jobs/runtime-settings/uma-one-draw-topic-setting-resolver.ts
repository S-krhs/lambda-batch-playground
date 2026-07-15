// In scope: UMA ワンドロお題通知 job が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { requireSecret } from "./require-secret.js";

/** UMA ワンドロお題通知 job が使う実行時設定。 */
export interface UmaOneDrawTopicSettings {
	discordWebhookUrl: string;
}

/** UMA ワンドロお題通知 job が使う実行時設定を解決する。 */
export const getUmaOneDrawTopicSettings = (): UmaOneDrawTopicSettings => {
	return {
		discordWebhookUrl: requireSecret("UmaOneDrawTopicDiscordWebhook"),
	};
};
