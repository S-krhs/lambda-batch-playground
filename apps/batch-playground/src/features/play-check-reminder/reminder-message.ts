// In scope: 遊技チェックリマインダーのプラットフォーム非依存なメッセージ構造を生成する
// Out of scope: Discord payload 生成、押下結果の判定、外部送信、Lambda レスポンス作成を行う
import {
	REMINDER_CHOICES,
	REMINDER_CUSTOM_ID_PREFIX,
	REMINDER_CUSTOM_ID_SEPARATOR,
	REMINDER_QUESTION,
	type ReminderChoiceStyle,
} from "./reminder-settings.js";

/** リマインダーメッセージに並べる選択肢ボタン。 */
export interface ReminderMessageChoice {
	customId: string;
	label: string;
	style: ReminderChoiceStyle;
}

/** 遊技チェックリマインダーのメッセージ。 */
export interface ReminderMessage {
	content: string;
	choices: readonly ReminderMessageChoice[];
}

/** 対象ユーザーへのメンション付きリマインダーメッセージを生成する。 */
export const buildReminderMessage = (targetUserId: string): ReminderMessage => {
	const normalizedTargetUserId = targetUserId.trim();

	if (!normalizedTargetUserId) {
		throw new Error("リマインダーの対象ユーザー ID が空です。");
	}

	return {
		content: `<@${normalizedTargetUserId}> ${REMINDER_QUESTION}`,
		choices: REMINDER_CHOICES.map((choice): ReminderMessageChoice => {
			return {
				customId: [
					REMINDER_CUSTOM_ID_PREFIX,
					normalizedTargetUserId,
					choice.id,
				].join(REMINDER_CUSTOM_ID_SEPARATOR),
				label: choice.label,
				style: choice.style,
			};
		}),
	};
};
