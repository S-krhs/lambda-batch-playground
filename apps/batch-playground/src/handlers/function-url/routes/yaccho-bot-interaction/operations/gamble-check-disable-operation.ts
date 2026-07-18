// In scope: gamble-check-disable command の実行場所確認、本人設定の削除、callback payload 生成
// Out of scope: command routing、DB query、HTTP response の形成
import { channelSettingRepository } from "@eskra-aws-playground/repositories/playground/channel-setting/repository.js";
import { applicationKeys } from "@eskra-aws-playground/repositories/playground/shared/literals/application-key.js";
import { settingKeys } from "@eskra-aws-playground/repositories/playground/shared/literals/setting-key.js";

import type { DiscordEphemeralResponsePayload } from "@/external-protocols/discord-message/interaction-response.js";
import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";
import { ephemeralOperation } from "./ephemeral-operation.js";

/** gamble-check-disable command を解決し、実行者本人のリマインダー設定だけを削除する。 */
export const gambleCheckDisableOperation = async (
	interaction: DiscordApplicationCommandInteraction,
): Promise<OperationResult<DiscordEphemeralResponsePayload>> => {
	if (interaction.context.kind !== "guild") {
		return ephemeralOperation("サーバー内のチャンネルで使ってね～");
	}

	const deletedSetting =
		await channelSettingRepository.deleteByGuildIdAndUserId({
			applicationKey: applicationKeys.yacchoBot,
			settingKey: settingKeys.playCheckReminder,
			guildId: interaction.context.guildId,
			userId: interaction.userId,
		});
	return ephemeralOperation(
		deletedSetting
			? "りょ～！またね～"
			: "よよよ……リマインダーはまだ設定されていないのです～",
	);
};
