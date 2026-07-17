// In scope: 遊技リマインダーのボタン押下から返す interaction callback payload の生成
// Out of scope: interaction 種別・コマンドのルーティング、payload の構造定義、HTTP response の形成
import {
	DISCORD_INTERACTION_CALLBACK_TYPES,
	DISCORD_MESSAGE_FLAGS,
	type DiscordEphemeralResponsePayload,
	type DiscordUpdateMessageResponsePayload,
} from "@/external-protocols/discord-message/interaction-response.js";
import type { DiscordInteraction } from "@/external-protocols/discord-message/parse.js";
import { parseReminderChoiceCustomId } from "@/features/play-check-reminder/reminder-choice-custom-id.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/**
 * 遊技リマインダーのボタン押下から返す interaction callback payload を生成する。
 * リマインダーの選択と解釈できない interaction には undefined を返す。
 */
export const playCheckReminderOperation = (
	interaction: DiscordInteraction,
):
	| OperationResult<
			DiscordUpdateMessageResponsePayload | DiscordEphemeralResponsePayload
	  >
	| undefined => {
	if (!interaction.customId || !interaction.pressedUserId) {
		return undefined;
	}

	const choice = parseReminderChoiceCustomId(interaction.customId);
	if (!choice) {
		return undefined;
	}

	if (interaction.pressedUserId !== choice.targetUserId) {
		return {
			kind: "OK",
			data: {
				type: DISCORD_INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: `このリマインダーは <@${choice.targetUserId}> さんしか使えないのです～、よよよ……`,
					flags: DISCORD_MESSAGE_FLAGS.EPHEMERAL,
					allowed_mentions: { parse: [] },
				},
			},
		};
	}

	return {
		kind: "OK",
		data: {
			type: DISCORD_INTERACTION_CALLBACK_TYPES.UPDATE_MESSAGE,
			data: {
				content: `でれれれれれ～、**${choice.choiceLabel}**！`,
				components: [],
				allowed_mentions: { parse: [] },
			},
		},
	};
};
