// In scope: UMA ワンドロお題通知を起動する one-time schedule の実行計画(名前・時刻)を決める
// Out of scope: Lambda イベント解釈、schedule の登録、起動対象 ARN の解決を行う
import { getCurrentJstDateString } from "@eskra-aws-playground/libs/date/current-jst-date.js";

import {
	INVOCATION_SCHEDULE_NAME_PREFIX,
	INVOCATION_TIMEZONE,
	INVOCATION_WINDOW_DURATION_MINUTES,
	INVOCATION_WINDOW_START_HOUR,
} from "./invocation-window-settings.js";

/** one-time schedule の実行計画。 */
export interface OneTimeInvocationPlan {
	/** 日付で一意にした schedule 名。同日の二重登録を登録時の重複エラーで防ぐ。 */
	scheduleName: string;
	/** at() 式へ渡す timezone ローカルの起動時刻(YYYY-MM-DDTHH:mm:ss)。 */
	scheduleAt: string;
	/** scheduleAt を解釈する IANA タイムゾーン。 */
	timezone: string;
}

const padTwoDigits = (value: number): string => {
	return String(value).padStart(2, "0");
};

/** 当日 JST の起動 window からランダムに起動時刻を選び、実行計画を作る。random は [0, 1) を返す関数。 */
export const planOneTimeInvocation = (
	random: () => number = Math.random,
): OneTimeInvocationPlan => {
	const date = getCurrentJstDateString();
	const offsetMinutes = Math.floor(
		random() * INVOCATION_WINDOW_DURATION_MINUTES,
	);
	const hour = INVOCATION_WINDOW_START_HOUR + Math.floor(offsetMinutes / 60);
	const minute = offsetMinutes % 60;

	return {
		scheduleName: `${INVOCATION_SCHEDULE_NAME_PREFIX}-${date}`,
		scheduleAt: `${date}T${padTwoDigits(hour)}:${padTwoDigits(minute)}:00`,
		timezone: INVOCATION_TIMEZONE,
	};
};
