// In scope: Orchestrator job が使う実行時設定の型と、SST link/環境変数からの解決を提供する
// Out of scope: Lambda イベント解釈、外部サービス送信、ジョブ判定を行う
import { Resource } from "sst/resource";

/** Orchestrator job が使う実行時設定。 */
export interface OrchestratorSettings {
	queueUrl: string;
}

/** Orchestrator job が使う実行時設定を解決する。 */
export const getOrchestratorSettings = (): OrchestratorSettings => {
	let linkedQueueUrl = "";

	try {
		const resources = Resource as unknown as Record<string, { url?: string }>;
		linkedQueueUrl = resources.AnimeAnalysisQueue?.url?.trim() ?? "";
	} catch {
		linkedQueueUrl = "";
	}

	const localQueueUrl = (process.env.ANIME_ANALYSIS_QUEUE_URL || "").trim();
	const queueUrl = linkedQueueUrl || localQueueUrl;
	if (!queueUrl) {
		throw new Error(
			"AnimeAnalysisQueue link または ANIME_ANALYSIS_QUEUE_URL が設定されていません。",
		);
	}

	return {
		queueUrl,
	};
};
