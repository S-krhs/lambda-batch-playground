// In scope: 遊技チェックリマインダーの custom_id の生成と解釈
// Out of scope: Discord component payload、押下ユーザーの認可、interaction response の生成
import {
	REMINDER_CHOICES,
	REMINDER_CUSTOM_ID_PREFIX,
} from "./reminder-settings.js";

const REMINDER_CUSTOM_ID_SEPARATOR = ":";

/** custom_id から解釈した遊技チェックリマインダーの選択。 */
export interface ReminderChoiceCustomId {
	targetUserId: string;
	choiceId: string;
	choiceLabel: string;
}

/** 対象ユーザーと選択肢から遊技チェックリマインダーの custom_id を生成する。 */
export const buildReminderChoiceCustomId = (
	targetUserId: string,
	choiceId: string,
): string => {
	return [REMINDER_CUSTOM_ID_PREFIX, targetUserId, choiceId].join(
		REMINDER_CUSTOM_ID_SEPARATOR,
	);
};

/** custom_id を遊技チェックリマインダーの選択として解釈する。 */
export const parseReminderChoiceCustomId = (
	customId: string,
): ReminderChoiceCustomId | undefined => {
	const parts = customId.split(REMINDER_CUSTOM_ID_SEPARATOR);
	if (parts.length !== 3) {
		return undefined;
	}

	const [prefix, targetUserId, choiceId] = parts;
	if (prefix !== REMINDER_CUSTOM_ID_PREFIX || !targetUserId) {
		return undefined;
	}

	const choice = REMINDER_CHOICES.find((candidate) => {
		return candidate.id === choiceId;
	});
	if (!choice) {
		return undefined;
	}

	return {
		targetUserId,
		choiceId: choice.id,
		choiceLabel: choice.label,
	};
};
