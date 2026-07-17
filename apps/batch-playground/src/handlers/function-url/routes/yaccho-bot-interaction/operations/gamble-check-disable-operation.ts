// In scope: gamble-check-disable command の実行場所確認、本人設定の削除、callback payload 生成
// Out of scope: command routing、DB query、HTTP response の形成
import type { DiscordEphemeralResponsePayload } from "@/external-protocols/discord-message/interaction-response.js";
import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import { reminderConfigStore } from "@/features/play-check-reminder/reminder-config-store.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";
import { ephemeralOperation } from "./ephemeral-operation.js";

/** gamble-check-disable command を解決し、実行者本人のリマインダー設定だけを削除する。 */
export const gambleCheckDisableOperation = async (
	interaction: DiscordApplicationCommandInteraction,
): Promise<OperationResult<DiscordEphemeralResponsePayload>> => {
	if (interaction.context.kind !== "guild") {
		return ephemeralOperation("サーバー内のチャンネルから実行してください。");
	}

	const deleted = await reminderConfigStore.deleteByGuildIdAndUserId(
		interaction.context.guildId,
		interaction.userId,
	);
	return ephemeralOperation(
		deleted
			? "自分のリマインダーを無効にしました。"
			: "自分のリマインダーは設定されていません。",
	);
};
