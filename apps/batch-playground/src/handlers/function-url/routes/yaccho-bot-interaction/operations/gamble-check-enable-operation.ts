// In scope: gamble-check-enable command の実行場所確認、本人設定の登録、callback payload 生成
// Out of scope: command routing、DB query、HTTP response の形成
import type { DiscordEphemeralResponsePayload } from "@/external-protocols/discord-message/interaction-response.js";
import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import { reminderConfigStore } from "@/features/play-check-reminder/reminder-config-store.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";
import { ephemeralOperation } from "./ephemeral-operation.js";

/** gamble-check-enable command を解決し、実行チャンネルで本人のリマインダーを有効にする。 */
export const gambleCheckEnableOperation = async (
	interaction: DiscordApplicationCommandInteraction,
): Promise<OperationResult<DiscordEphemeralResponsePayload>> => {
	if (interaction.context.kind !== "guild" || !interaction.context.channelId) {
		return ephemeralOperation("サーバー内のチャンネルから実行してください。");
	}

	await reminderConfigStore.save({
		guildId: interaction.context.guildId,
		channelId: interaction.context.channelId,
		userId: interaction.userId,
	});
	return ephemeralOperation(
		"このチャンネルで自分のリマインダーを有効にしました。",
	);
};
