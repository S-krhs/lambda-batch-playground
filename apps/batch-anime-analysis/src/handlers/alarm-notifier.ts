// In scope: CloudWatch alarm の SNS event を受け取り、Discord へアラート通知する
// Out of scope: アラート通知文の生成詳細や Webhook URL 解決の詳細を持つ
import { DiscordWebhookClient } from "@lambda-batch-playground/integration-discord/discord-webhook-client.js";
import { createBatchLogger } from "@lambda-batch-playground/libs/logger/batch-logger.js";
import { buildAlarmReport } from "../features/notifications/alarm-report.js";
import type { SnsEvent } from "../shared/infra/lambda.js";
import { getAlertSettings } from "../shared/infra/secrets.js";

const logger = createBatchLogger("alarm-notifier");

/** CloudWatch alarm を Discord へ通知する Lambda のエントリポイント。 */
export const handler = async (event: SnsEvent): Promise<void> => {
	const { discordWebhookUrl } = getAlertSettings();
	const client = new DiscordWebhookClient(discordWebhookUrl);

	for (const record of event.Records) {
		// 通知自体の失敗で SNS 再試行を誘発しないよう、ログに留めて次の record へ進む。
		try {
			await client.postMessage(buildAlarmReport(record.Sns.Message));
		} catch (error) {
			logger.failure(error);
		}
	}
};
