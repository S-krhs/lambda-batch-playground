// In scope: Lambda イベントからジョブ名を推定し、登録済みジョブのハンドラーへ解決する
// Out of scope: 個別ジョブの処理内容や外部連携の詳細を持つ
import { umaOneDrawTopicJob } from "../jobs/uma-one-draw-topic.js";
import type { BatchHandler, LambdaEvent } from "../shared/infra/lambda.js";
import {
	type BatchName,
	batchNameList,
	batchNames,
} from "../shared/routes/batch-names.js";

const isBatchName = (value: string): value is BatchName => {
	return batchNameList.includes(value as BatchName);
};

/** Lambda イベントから実行対象のジョブ名を取得する。 */
export const getJobName = (event: LambdaEvent): BatchName => {
	if (typeof event.job === "string" && event.job.trim()) {
		const jobName = event.job.trim().toLowerCase();

		if (isBatchName(jobName)) {
			return jobName;
		}

		throw new Error("未対応の batch job です");
	}

	throw new Error("job が設定されていません");
};

/** ジョブ名に対応するバッチハンドラーを返す。 */
export const resolveBatchJob = (jobName: BatchName): BatchHandler => {
	switch (jobName) {
		case batchNames.umaOneDrawTopic:
			return umaOneDrawTopicJob;
	}
};
