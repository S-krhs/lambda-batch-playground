// In scope: UMA ワンドロお題 scheduler job が使う実行時設定の型と、環境変数・Lambda context からの解決を提供する
// Out of scope: Lambda イベント解釈、起動時刻の決定、schedule の登録を行う
import { z } from "zod";

/** UMA ワンドロお題 scheduler job が使う実行時設定。 */
export interface UmaOneDrawTopicSchedulerSettings {
	/** one-time schedule を所属させる schedule group 名。 */
	scheduleGroupName: string;
	/** one-time schedule が起動時に引き受ける role の ARN。 */
	schedulerRoleArn: string;
}

/** UMA ワンドロお題 scheduler job が使う実行時設定を解決する。 */
export const getUmaOneDrawTopicSchedulerSettings =
	(): UmaOneDrawTopicSchedulerSettings => {
		const scheduleGroupName = (
			process.env.UMA_ONE_DRAW_TOPIC_SCHEDULE_GROUP_NAME ?? ""
		).trim();
		const schedulerRoleArn = (
			process.env.UMA_ONE_DRAW_TOPIC_SCHEDULER_ROLE_ARN ?? ""
		).trim();

		if (!scheduleGroupName || !schedulerRoleArn) {
			throw new Error(
				"UMA_ONE_DRAW_TOPIC_SCHEDULE_GROUP_NAME または UMA_ONE_DRAW_TOPIC_SCHEDULER_ROLE_ARN が設定されていません。",
			);
		}

		return {
			scheduleGroupName,
			schedulerRoleArn,
		};
	};

const invocationContextSchema = z.object({
	invokedFunctionArn: z.string().trim().min(1),
});

/** one-time schedule の起動対象(この Lambda 自身)の ARN を Lambda context から解決する。ローカル実行では環境変数で代替する。 */
export const resolveTargetFunctionArn = (context: unknown): string => {
	const parsedContext = invocationContextSchema.safeParse(context);

	if (parsedContext.success) {
		return parsedContext.data.invokedFunctionArn;
	}

	const localTargetFunctionArn = (
		process.env.UMA_ONE_DRAW_TOPIC_TARGET_FUNCTION_ARN ?? ""
	).trim();

	if (localTargetFunctionArn) {
		return localTargetFunctionArn;
	}

	throw new Error(
		"Lambda context または UMA_ONE_DRAW_TOPIC_TARGET_FUNCTION_ARN から起動対象の ARN を解決できません。",
	);
};
