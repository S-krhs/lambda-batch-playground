// In scope: 遊技リマインダーのボタン押下から返す interaction callback payload を解決する
// Out of scope: interaction 種別・コマンドのルーティング、payload の構造定義、HTTP response の形成
import {
	buildInteractionResponse,
	type DiscordInteractionResponsePayload,
} from "@/external-protocols/discord-message/build.js";
import {
	type DiscordInteraction,
	resolveChoice,
} from "@/external-protocols/discord-message/parse.js";
import {
	REMINDER_CHOICES,
	REMINDER_CUSTOM_ID_PREFIX,
} from "@/features/play-check-reminder/reminder-settings.js";
import type {
	Forbidden,
	OperationResult,
} from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/**
 * 遊技リマインダーのボタン押下から返す interaction callback payload を解決する。
 * リマインダーの選択と解釈できない interaction には undefined を返す。
 */
export const resolveReminderChoice = (
	interaction: DiscordInteraction,
):
	| OperationResult<
			DiscordInteractionResponsePayload,
			Forbidden<DiscordInteractionResponsePayload>
	  >
	| undefined => {
	const selection = resolveChoice(interaction, {
		customIdPrefix: REMINDER_CUSTOM_ID_PREFIX,
		choices: REMINDER_CHOICES,
	});
	if (!selection) {
		return undefined;
	}

	if (selection.pressedUserId !== selection.targetUserId) {
		return {
			kind: "FORBIDDEN",
			data: buildInteractionResponse({
				kind: "ephemeral",
				content: `このリマインダーは <@${selection.targetUserId}> さんしか使えないのです～、よよよ……`,
			}),
		};
	}

	return {
		kind: "OK",
		data: buildInteractionResponse({
			kind: "update-message",
			content: `でれれれれれ～、**${selection.choiceLabel}**！`,
		}),
	};
};
