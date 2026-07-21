// In scope: sqs-worker Lambda の起動イベント schema と、Lambda へ返す partial batch response の型を提供する
// Out of scope: message body の業務的解釈、ジョブ解決、record ごとの実行制御を行う
import { z } from "zod";

/** sqs-worker Lambda が受け取る起動イベント schema。SQS が record をまとめて届ける。 */
export const sqsWorkerEventSchema = z.object({
	Records: z.array(
		z.object({
			messageId: z.string().min(1),
			body: z.string(),
		}),
	),
});

/** sqs-worker Lambda が受け取る起動イベント。 */
export type SqsWorkerEvent = z.infer<typeof sqsWorkerEventSchema>;

/** sqs-worker Lambda が返す SQS partial batch response。失敗した record だけを再試行対象にする。 */
export interface SqsWorkerResponse {
	batchItemFailures: {
		itemIdentifier: string;
	}[];
}
