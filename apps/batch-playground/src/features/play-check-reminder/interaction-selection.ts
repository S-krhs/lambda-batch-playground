// In scope: ボタン押下の custom_id と押下ユーザーから選択結果を判定し、応答本文を生成する
// Out of scope: Discord interaction イベントの解釈、署名検証、応答 payload 生成、外部送信を行う
import {
	REMINDER_CHOICES,
	REMINDER_CUSTOM_ID_PREFIX,
	REMINDER_CUSTOM_ID_SEPARATOR,
	REMINDER_QUESTION,
} from "./reminder-settings.js";

/** ボタン押下の判定結果。 */
export type InteractionSelectionResult =
	| { kind: "not-target"; targetUserId: string }
	| { kind: "selected"; choiceLabel: string; targetUserId: string }
	| { kind: "unknown" };

/** custom_id と押下ユーザー ID から遊技チェックリマインダーの選択結果を判定する。 */
export const resolveInteractionSelection = (
	customId: string,
	pressedUserId: string,
): InteractionSelectionResult => {
	const parts = customId.split(REMINDER_CUSTOM_ID_SEPARATOR);

	if (parts.length !== 3) {
		return { kind: "unknown" };
	}

	const [prefix, targetUserId, choiceId] = parts;

	if (prefix !== REMINDER_CUSTOM_ID_PREFIX || !targetUserId) {
		return { kind: "unknown" };
	}

	const choice = REMINDER_CHOICES.find((candidate) => {
		return candidate.id === choiceId;
	});

	if (!choice) {
		return { kind: "unknown" };
	}

	if (pressedUserId !== targetUserId) {
		return { kind: "not-target", targetUserId };
	}

	return { kind: "selected", choiceLabel: choice.label, targetUserId };
};

/** 選択確定時に元メッセージへ上書きする本文を生成する。 */
export const buildSelectedUpdateContent = (
	targetUserId: string,
	choiceLabel: string,
): string => {
	return `<@${targetUserId}> ${REMINDER_QUESTION}\n**${choiceLabel}** を選択しました`;
};

/** 対象外ユーザーの押下時に本人へだけ見せる本文を生成する。 */
export const buildNotTargetEphemeralContent = (
	targetUserId: string,
): string => {
	return `このリマインダーは <@${targetUserId}> さん専用です。`;
};
