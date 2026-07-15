// In scope: Discord MESSAGE_COMPONENT interactionを解釈し、返すメッセージの中間結果を生成する
// Out of scope: interaction type のrouting、署名認証、Discord response の形成
import {
	type DiscordInteraction,
	resolveChoice,
} from "../../../../../external-protocols/discord/discord-message.js";
import {
	REMINDER_CHOICES,
	REMINDER_CUSTOM_ID_PREFIX,
	REMINDER_QUESTION,
} from "../../../../../features/play-check-reminder/reminder-settings.js";

type MessageComponentOperationResult =
	| { kind: "update-message"; content: string }
	| { kind: "ephemeral"; content: string };

/** MESSAGE_COMPONENT の選択情報から返すメッセージを生成する。 */
export const messageComponentOperation = (
	interaction: DiscordInteraction,
): MessageComponentOperationResult => {
	const selection = resolveChoice(interaction, {
		customIdPrefix: REMINDER_CUSTOM_ID_PREFIX,
		choices: REMINDER_CHOICES,
	});
	if (!selection) {
		return {
			kind: "ephemeral",
			content: "この操作には対応していません。",
		};
	}

	if (selection.pressedUserId !== selection.targetUserId) {
		return {
			kind: "ephemeral",
			content: `このリマインダーは <@${selection.targetUserId}> さん専用です。`,
		};
	}

	return {
		kind: "update-message",
		content: `<@${selection.targetUserId}> ${REMINDER_QUESTION}\n**${selection.choiceLabel}** を選択しました`,
	};
};
