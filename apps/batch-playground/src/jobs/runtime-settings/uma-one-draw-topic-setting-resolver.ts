// In scope: UMA ワンドロお題通知 job が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** UMA ワンドロお題通知 job が使う実行時設定。 */
export interface UmaOneDrawTopicSettings {
	discordWebhookUrl: string;
}

/** UMA ワンドロお題通知 job が使う実行時設定を解決する。 */
export const getUmaOneDrawTopicSettings = (): UmaOneDrawTopicSettings => {
	const resources = Resource as unknown as Record<string, { value?: string }>;
	const discordWebhookUrl =
		resources.UmaOneDrawTopicDiscordWebhook.value?.trim() ?? "";

	if (!discordWebhookUrl) {
		throw new Error(
			"UmaOneDrawTopicDiscordWebhook secret が設定されていません。",
		);
	}

	return {
		discordWebhookUrl,
	};
};
