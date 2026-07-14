// In scope: UMA ワンドロお題通知の one-time schedule 登録をオーケストレーションする
// Out of scope: 起動時刻の決定ロジックや EventBridge Scheduler API 通信の詳細を持つ
import { OneTimeScheduleClient } from "@eskra-aws-playground/integration-scheduler/one-time-schedule-client.js";
import { createBatchLogger } from "@eskra-aws-playground/libs/logger/batch-logger.js";

import { planOneTimeInvocation } from "../features/uma-one-draw-topic-scheduler/one-time-invocation-plan.js";
import { batchNames } from "../shared/routes/batch-names.js";
import type { BatchResponse } from "../shared/schemas/lambda/batch/response.js";
import {
	getUmaOneDrawTopicSchedulerSettings,
	resolveTargetFunctionArn,
} from "./runtime-settings/uma-one-draw-topic-scheduler-setting-resolver.js";

const logger = createBatchLogger(batchNames.umaOneDrawTopicScheduler);

/** UMA ワンドロお題通知を当日ランダムな時刻に起動する one-time schedule を登録するバッチジョブ。 */
export const umaOneDrawTopicSchedulerJob = async (
	_event: unknown,
	context?: unknown,
): Promise<BatchResponse> => {
	// 1. 実行時設定から schedule group・role・起動対象 Lambda の ARN を解決する。
	const { scheduleGroupName, schedulerRoleArn } =
		getUmaOneDrawTopicSchedulerSettings();
	const targetFunctionArn = resolveTargetFunctionArn(context);

	logger.start();

	// 2. feature で当日の起動 window 内からランダムな起動時刻の実行計画を作る。
	const invocationPlan = planOneTimeInvocation();

	// 3. EventBridge Scheduler integration へ one-time schedule の登録を委譲する。
	//    当日分が登録済み(同名 schedule が存在)の場合は二重登録せず正常終了する。
	const scheduleClient = new OneTimeScheduleClient();
	const { created } = await scheduleClient.createSchedule({
		name: invocationPlan.scheduleName,
		groupName: scheduleGroupName,
		scheduleAt: invocationPlan.scheduleAt,
		timezone: invocationPlan.timezone,
		targetArn: targetFunctionArn,
		roleArn: schedulerRoleArn,
		input: { job: batchNames.umaOneDrawTopic },
	});

	logger.complete({ scheduleAt: invocationPlan.scheduleAt, created });

	// 4. Lambda ハンドラーへ共通レスポンスを返す。
	return {
		ok: true,
		job: batchNames.umaOneDrawTopicScheduler,
		details: {
			scheduleAt: invocationPlan.scheduleAt,
			created,
		},
	};
};
