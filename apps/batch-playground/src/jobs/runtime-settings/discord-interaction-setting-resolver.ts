// In scope: Discord interaction handler が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、署名検証、応答生成を行う
import { Resource } from "sst/resource";

/** Discord interaction handler が使う実行時設定。 */
export interface DiscordInteractionSettings {
	discordInteractionPublicKey: string;
}

/** Discord interaction handler が使う実行時設定を解決する。 */
export const getDiscordInteractionSettings = (): DiscordInteractionSettings => {
	const resources = Resource as unknown as Record<string, { value?: string }>;
	const discordInteractionPublicKey =
		resources.DiscordInteractionPublicKey.value?.trim() ?? "";

	if (!discordInteractionPublicKey) {
		throw new Error(
			"DiscordInteractionPublicKey secret が設定されていません。",
		);
	}

	return {
		discordInteractionPublicKey,
	};
};
