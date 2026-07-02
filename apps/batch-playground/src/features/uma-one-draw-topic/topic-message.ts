// やること: UMA ワンドロのお題メッセージを生成する
// やらないこと: Discord payload 生成、外部送信、Lambda レスポンス作成を行う
import {
	UMA_ONE_DRAW_TOPIC_MESSAGE_TEMPLATE,
	UMA_ONE_DRAW_TOPIC_NAMES,
} from "./topic-settings.js";

/** UMA ワンドロのお題メッセージ。 */
export interface UmaOneDrawTopicMessage {
	content: string;
}

const pickRandomName = (
	names: readonly string[],
	random: () => number,
): string => names[Math.floor(random() * names.length)];

const selectTopicName = (random: () => number): string => {
	const isC = random() < 0.9;
	const names = UMA_ONE_DRAW_TOPIC_NAMES;

	if (isC && names.c.length) {
		return pickRandomName(names.c, random);
	}

	if (!isC && names.r.length) {
		return pickRandomName(names.r, random);
	}

	if (names.c.length) {
		return pickRandomName(names.c, random);
	}

	if (names.r.length) {
		return pickRandomName(names.r, random);
	}

	throw new Error("UMA_ONE_DRAW_TOPIC_NAMES に値を設定してください");
};

/** UMA ワンドロのお題通知に使うメッセージ本文を生成する。 */
export const buildUmaOneDrawTopicMessage = (
	random: () => number = Math.random,
): UmaOneDrawTopicMessage => {
	const messageTemplate = UMA_ONE_DRAW_TOPIC_MESSAGE_TEMPLATE;
	const selectedName = selectTopicName(random);

	if (!selectedName || !messageTemplate) {
		throw new Error("選択されたお題が不正です");
	}

	return {
		content: messageTemplate.replace("{{selectedName}}", selectedName),
	};
};
