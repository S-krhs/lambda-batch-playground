// In scope: Orchestrator Lambda が返すレスポンスの型を提供する
// Out of scope: 起動イベントの検証、SQS 送信、ジョブ本体の処理を行う

/** Orchestrator Lambda が返すレスポンス。 */
export interface OrchestratorResponse {
	ok: true;
	job: string;
	details?: Record<string, unknown>;
}
