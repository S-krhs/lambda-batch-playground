// In scope: dataSource スクレイピング job が使う実行時設定の型と、SST link/環境変数からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** dataSource スクレイピング job が使う実行時設定。 */
export interface DataSourceSettings {
	discordWebhookUrl: string;
}

/** dataSource スクレイピング job が使う実行時設定を解決する。 */
export const getDataSourceSettings = (): DataSourceSettings => {
	let linkedDiscordWebhookUrl = "";

	try {
		const resources = Resource as unknown as Record<string, { value?: string }>;
		const linkedDiscordWebhook = resources.AnimeAnalysisDiscordWebhook;
		linkedDiscordWebhookUrl = linkedDiscordWebhook.value?.trim() ?? "";
	} catch {
		linkedDiscordWebhookUrl = "";
	}

	const localDiscordWebhookUrl = (
		process.env.ANIME_ANALYSIS_DISCORD_WEBHOOK_URL ||
		process.env.DEFAULT_DISCORD_WEBHOOK_URL ||
		""
	).trim();
	const discordWebhookUrl = linkedDiscordWebhookUrl || localDiscordWebhookUrl;

	if (!discordWebhookUrl) {
		throw new Error(
			"AnimeAnalysisDiscordWebhook secret またはローカル用 Discord Webhook URL が設定されていません。",
		);
	}

	return {
		discordWebhookUrl,
	};
};
