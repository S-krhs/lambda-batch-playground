// In scope: 遊技チェックリマインダーの質問文・選択肢・custom_id 形式の設定値を定義する
// Out of scope: メッセージ生成、押下結果の判定、Discord payload 生成、外部送信を行う

/** 遊技チェックリマインダーの質問文。 */
export const REMINDER_QUESTION = "今日は遊技をしましたか？";

/** ボタン custom_id の prefix。custom_id は `play-check-reminder:<targetUserId>:<choiceId>` 形式。 */
export const REMINDER_CUSTOM_ID_PREFIX = "play-check-reminder";

/** custom_id の区切り文字。 */
export const REMINDER_CUSTOM_ID_SEPARATOR = ":";

/** 選択肢ボタンの見た目 style。Discord のボタン style 値と同じ意味を持つ。 */
export type ReminderChoiceStyle = 1 | 2 | 3 | 4;

/** 遊技チェックリマインダーの選択肢。 */
export interface ReminderChoice {
	id: string;
	label: string;
	style: ReminderChoiceStyle;
}

/** 遊技チェックリマインダーの選択肢一覧。 */
export const REMINDER_CHOICES: readonly ReminderChoice[] = [
	{ id: "won", label: "はい（勝った）", style: 3 },
	{ id: "lost", label: "はい（負けた）", style: 4 },
	{ id: "not-played", label: "いいえ", style: 2 },
];
