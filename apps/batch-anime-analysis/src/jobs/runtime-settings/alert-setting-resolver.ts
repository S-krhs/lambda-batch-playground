// In scope: アラート通知 job が使う実行時設定の型と、SST link/環境変数からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** アラート通知 job が使う実行時設定。 */
export interface AlertSettings {
	discordWebhookUrl: string;
}

/** アラート通知 job が使う実行時設定を解決する。 */
export const getAlertSettings = (): AlertSettings => {
	let linkedDiscordWebhookUrl = "";

	try {
		const resources = Resource as unknown as Record<string, { value?: string }>;
		linkedDiscordWebhookUrl =
			resources.AlertDiscordWebhook?.value?.trim() ?? "";
	} catch {
		linkedDiscordWebhookUrl = "";
	}

	const localDiscordWebhookUrl = (
		process.env.ALERT_DISCORD_WEBHOOK_URL ||
		process.env.DEFAULT_DISCORD_WEBHOOK_URL ||
		""
	).trim();
	const discordWebhookUrl = linkedDiscordWebhookUrl || localDiscordWebhookUrl;

	if (!discordWebhookUrl) {
		throw new Error(
			"AlertDiscordWebhook secret またはローカル用アラート Discord Webhook URL が設定されていません。",
		);
	}

	return {
		discordWebhookUrl,
	};
};
