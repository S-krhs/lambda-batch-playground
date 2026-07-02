// やること: Lambda イベントからジョブ名を推定し、登録済みジョブのハンドラーへ解決する
// やらないこと: 個別ジョブの処理内容や外部連携の詳細を持つ
import { umaOneDrawTopicJobHandler } from "../jobs/uma-one-draw-topic.js";
import type { BatchHandler, LambdaEvent } from "../shared/infra/lambda.js";

/** Lambda イベントから実行対象のジョブ名を取得する。 */
export const getJobName = (event: LambdaEvent): string => {
	if (typeof event.job === "string" && event.job.trim()) {
		return event.job.trim().toLowerCase();
	}

	throw new Error("job が設定されていません");
};

/** ジョブ名に対応するバッチハンドラーを返す。 */
export const resolveBatchJob = (jobName: string): BatchHandler => {
	const normalizedName = jobName.trim().toLowerCase();

	switch (normalizedName) {
		case "uma-one-draw-topic":
			return umaOneDrawTopicJobHandler;
		default:
			throw new Error(`Unknown batch job: ${jobName}`);
	}
};
