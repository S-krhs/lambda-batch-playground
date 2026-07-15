// In scope: Discord interaction handler が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、署名検証、応答生成を行う
import { requireSecret } from "./require-secret.js";

/** Discord interaction handler が使う実行時設定。 */
export interface DiscordInteractionSettings {
	discordInteractionPublicKey: string;
}

/** Discord interaction handler が使う実行時設定を解決する。 */
export const getDiscordInteractionSettings = (): DiscordInteractionSettings => {
	return {
		discordInteractionPublicKey: requireSecret("DiscordInteractionPublicKey"),
	};
};
