// In scope: Worker Lambda (sqs-worker) が Lambda へ返す partial batch response の型を提供する
// Out of scope: SQS event の検証、message body の解釈、record ごとの実行制御を行う

/** Worker Lambda が返す SQS partial batch response。失敗した record だけを再試行対象にする。 */
export interface SqsWorkerResponse {
	batchItemFailures: {
		itemIdentifier: string;
	}[];
}
