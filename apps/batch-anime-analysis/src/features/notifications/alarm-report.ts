// In scope: CloudWatch alarm の SNS 通知内容から Discord 通知文を生成する
// Out of scope: SNS event の受信、Webhook URL 解決、HTTP 送信を行う

/** CloudWatch alarm の SNS Message に含まれる主要フィールド。 */
interface CloudWatchAlarmMessage {
	AlarmName?: string;
	AlarmDescription?: string | null;
	NewStateValue?: string;
	NewStateReason?: string;
	StateChangeTime?: string;
	Region?: string;
}

const MAX_REASON_LENGTH = 500;

/** CloudWatch alarm の SNS Message から Discord 通知文を生成する。 */
export const buildAlarmReport = (snsMessage: string): string => {
	const alarm = parseAlarmMessage(snsMessage);

	if (!alarm) {
		return [
			"🚨 **バッチアラート**",
			"",
			truncate(snsMessage, MAX_REASON_LENGTH),
		].join("\n");
	}

	const lines = [
		"🚨 **バッチアラート**",
		`> 🔔 アラーム：${alarm.AlarmName ?? "(不明)"}`,
		`> 📟 状態：${alarm.NewStateValue ?? "(不明)"}`,
	];
	if (alarm.Region) {
		lines.push(`> 🌏 リージョン：${alarm.Region}`);
	}
	if (alarm.StateChangeTime) {
		lines.push(`> 🕒 発生時刻：${alarm.StateChangeTime}`);
	}
	if (alarm.NewStateReason) {
		lines.push("", truncate(alarm.NewStateReason, MAX_REASON_LENGTH));
	}

	return lines.join("\n");
};

/** SNS Message を CloudWatch alarm として解釈する。解釈できなければ null。 */
const parseAlarmMessage = (
	snsMessage: string,
): CloudWatchAlarmMessage | null => {
	try {
		const parsed: unknown = JSON.parse(snsMessage);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"AlarmName" in parsed
		) {
			return parsed as CloudWatchAlarmMessage;
		}
	} catch {
		return null;
	}

	return null;
};

/** 文字列を最大長で切り詰める。 */
const truncate = (text: string, maxLength: number): string => {
	return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};
