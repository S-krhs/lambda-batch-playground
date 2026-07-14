// In scope: UMA ワンドロお題 scheduler job が使う実行時設定の型と、SST が設定する環境変数・Lambda context からの解決を提供する
// Out of scope: Lambda イベント解釈、起動時刻の決定、schedule の登録を行う
import { batchContextSchema } from "../../shared/schemas/lambda/batch/context.js";

/** UMA ワンドロお題 scheduler job が使う実行時設定。 */
export interface UmaOneDrawTopicSchedulerSettings {
	/** one-time schedule を所属させる schedule group 名。 */
	scheduleGroupName: string;
	/** one-time schedule が起動時に引き受ける role の ARN。 */
	schedulerRoleArn: string;
}

const requireEnv = (name: string): string => {
	const value = (process.env[name] ?? "").trim();

	if (!value) {
		throw new Error(`${name} が設定されていません。`);
	}

	return value;
};

/** UMA ワンドロお題 scheduler job が使う実行時設定を解決する。 */
export const getUmaOneDrawTopicSchedulerSettings =
	(): UmaOneDrawTopicSchedulerSettings => {
		return {
			scheduleGroupName: requireEnv("UMA_ONE_DRAW_TOPIC_SCHEDULE_GROUP_NAME"),
			schedulerRoleArn: requireEnv("UMA_ONE_DRAW_TOPIC_SCHEDULER_ROLE_ARN"),
		};
	};

/** one-time schedule の起動対象(この Lambda 自身)の ARN を Lambda context から解決する。 */
export const resolveTargetFunctionArn = (context: unknown): string => {
	const parsedContext = batchContextSchema.safeParse(context);

	if (!parsedContext.success) {
		throw new Error("Lambda context から起動対象の ARN を解決できません。");
	}

	return parsedContext.data.invokedFunctionArn;
};
