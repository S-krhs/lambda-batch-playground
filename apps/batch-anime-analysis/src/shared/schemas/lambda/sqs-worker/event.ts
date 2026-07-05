// In scope: Worker Lambda (sqs-worker) が受け取る起動イベントの外部入力 schema と型を提供する
// Out of scope: SQS 送信、message body の業務的解釈、record ごとの実行制御を行う
import { z } from "zod";

/** Worker Lambda が受け取る起動イベント schema。SQS が record をまとめて届ける。 */
export const sqsWorkerEventSchema = z.object({
	Records: z.array(
		z.object({
			messageId: z.string().min(1),
			body: z.string(),
		}),
	),
});

/** Worker Lambda が受け取る起動イベント。 */
export type SqsWorkerEvent = z.infer<typeof sqsWorkerEventSchema>;
