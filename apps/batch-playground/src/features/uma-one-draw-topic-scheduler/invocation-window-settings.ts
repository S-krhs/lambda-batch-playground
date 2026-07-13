// In scope: UMA ワンドロお題通知の one-time schedule 計画に使う設定値を定義する
// Out of scope: 起動時刻の決定、schedule の登録を行う

/** one-time schedule 名の接頭辞。日付を続けて日単位で一意な名前にする。 */
export const INVOCATION_SCHEDULE_NAME_PREFIX = "uma-one-draw-topic";

/** 起動 window の開始時刻(時)。 */
export const INVOCATION_WINDOW_START_HOUR = 12;

/** 起動 window の長さ(分)。 */
export const INVOCATION_WINDOW_DURATION_MINUTES = 360;

/** 起動時刻を解釈する IANA タイムゾーン。 */
export const INVOCATION_TIMEZONE = "Asia/Tokyo";
