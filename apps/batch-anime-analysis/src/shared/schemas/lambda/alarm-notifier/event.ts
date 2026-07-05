// In scope: Notifier Lambda (alarm-notifier) が受け取る起動イベントの外部入力 schema と型を提供する
// Out of scope: 通知文生成、Webhook URL 解決、送信処理を行う
import { z } from "zod";

/** Notifier Lambda が受け取る起動イベント schema。CloudWatch alarm が SNS 経由で届く。 */
export const alarmNotifierEventSchema = z.object({
	Records: z.array(
		z.object({
			Sns: z.object({
				Message: z.string(),
				Subject: z.string().optional(),
				Timestamp: z.string().optional(),
			}),
		}),
	),
});

/** Notifier Lambda が受け取る起動イベント。 */
export type AlarmNotifierEvent = z.infer<typeof alarmNotifierEventSchema>;
