// In scope: 遊技チェックリマインダーとして Discord へ投稿するメッセージ payload の生成
// Out of scope: Discord API 通信、interaction response、押下結果の判定
import type {
	DiscordButtonComponent,
	DiscordChannelMessagePayload,
} from "@eskra-aws-playground/integration-discord/discord-bot-client.js";

import { buildReminderChoiceCustomId } from "./reminder-choice-custom-id.js";
import {
	REMINDER_CHOICES,
	REMINDER_QUESTION,
	type ReminderChoiceTone,
} from "./reminder-settings.js";

const REMINDER_BUTTON_STYLES: Record<
	ReminderChoiceTone,
	DiscordButtonComponent["style"]
> = {
	positive: 3,
	negative: 4,
	neutral: 2,
};

/** 対象ユーザーへ質問する遊技チェックリマインダーメッセージを生成する。 */
export const buildReminderQuestionMessage = (
	targetUserId: string,
): DiscordChannelMessagePayload => {
	return {
		content: `<@${targetUserId}> ${REMINDER_QUESTION}`,
		allowed_mentions: { parse: [], users: [targetUserId] },
	};
};

/** 遊技チェックリマインダーの選択肢ボタンメッセージを生成する。 */
export const buildReminderChoicesMessage = (
	targetUserId: string,
): DiscordChannelMessagePayload => {
	return {
		components: [
			{
				type: 1,
				components: REMINDER_CHOICES.map((choice) => {
					return {
						type: 2,
						style: REMINDER_BUTTON_STYLES[choice.tone],
						label: choice.label,
						custom_id: buildReminderChoiceCustomId(targetUserId, choice.id),
					};
				}),
			},
		],
		allowed_mentions: { parse: [] },
	};
};
