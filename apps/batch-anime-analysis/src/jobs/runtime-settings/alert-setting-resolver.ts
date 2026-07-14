// In scope: アラート通知 job が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** アラート通知 job が使う実行時設定。 */
export interface AlertSettings {
	discordWebhookUrl: string;
}

/** アラート通知 job が使う実行時設定を解決する。 */
export const getAlertSettings = (): AlertSettings => {
	const resources = Resource as unknown as Record<string, { value?: string }>;
	const discordWebhookUrl = resources.AlertDiscordWebhook?.value?.trim() ?? "";

	if (!discordWebhookUrl) {
		throw new Error("AlertDiscordWebhook secret が設定されていません。");
	}

	return {
		discordWebhookUrl,
	};
};
