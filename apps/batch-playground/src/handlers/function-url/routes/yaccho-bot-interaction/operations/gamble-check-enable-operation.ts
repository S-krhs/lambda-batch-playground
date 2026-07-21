// In scope: gamble-check-enable の実行場所を確認し、deferred 応答で ACK して登録ジョブを enqueue する
// Out of scope: command routing、DB query、HTTP response の形成、確定メッセージの生成
import {
	type DiscordDeferredMessageResponsePayload,
	type DiscordEphemeralResponsePayload,
	messageFlags,
	responseTypes,
} from "@/external-protocols/discord-message/interaction-response.js";
import type {
	DiscordApplicationCommandInteraction,
	DiscordInteractionCallback,
} from "@/external-protocols/discord-message/parse.js";
import { interactionJobNames } from "@/features/interaction-job/job-names.js";
import { enqueueInteractionJob } from "@/handlers/function-url/interaction-job/enqueue.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";
import { ephemeralOperation } from "./ephemeral-operation.js";

/** gamble-check-enable の実行場所を確認し、ephemeral な deferred 応答で ACK して登録ジョブを enqueue する。 */
export const gambleCheckEnableOperation = async (
	interaction: DiscordApplicationCommandInteraction,
	callback: DiscordInteractionCallback,
): Promise<
	OperationResult<
		DiscordEphemeralResponsePayload | DiscordDeferredMessageResponsePayload
	>
> => {
	if (interaction.context.kind !== "guild" || !interaction.context.channelId) {
		return ephemeralOperation("サーバー内のチャンネルで使ってね～");
	}

	await enqueueInteractionJob({
		job: interactionJobNames.gambleCheckEnable,
		applicationId: callback.applicationId,
		token: callback.token,
		guildId: interaction.context.guildId,
		channelId: interaction.context.channelId,
		userId: interaction.userId,
	});

	return {
		kind: "OK",
		data: {
			type: responseTypes.deferredMessage,
			data: { flags: messageFlags.ephemeral },
		},
	};
};
