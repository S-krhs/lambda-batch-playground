// In scope: Orchestrator job が使う実行時設定の型と、SST link からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** Orchestrator job が使う実行時設定。 */
export interface OrchestratorSettings {
	queueUrl: string;
}

/** Orchestrator job が使う実行時設定を解決する。 */
export const getOrchestratorSettings = (): OrchestratorSettings => {
	const resources = Resource as unknown as Record<string, { url?: string }>;
	const queueUrl = resources.AnimeAnalysisQueue?.url?.trim() ?? "";

	if (!queueUrl) {
		throw new Error("AnimeAnalysisQueue link が設定されていません。");
	}

	return {
		queueUrl,
	};
};
