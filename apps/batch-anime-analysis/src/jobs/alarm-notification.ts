// In scope: SNS event の各 CloudWatch alarm を Discord へ通知する
// Out of scope: Lambda エントリポイント、通知失敗の握り潰し、通知文生成の詳細を持つ
import { DiscordWebhookClient } from "@lambda-batch-playground/integration-discord/discord-webhook-client.js";
import { createBatchLogger } from "@lambda-batch-playground/libs/logger/batch-logger.js";
import { buildAlarmReport } from "../features/notifications/alarm-report.js";
import type { SnsEvent } from "../shared/infra/lambda.js";
import { getAlertSettings } from "../shared/infra/secrets.js";

const logger = createBatchLogger("alarm-notification");

/** SNS event に含まれる CloudWatch alarm を Discord へ通知する。 */
export const alarmNotificationJob = async (event: SnsEvent): Promise<void> => {
	logger.start({ recordCount: event.Records.length });

	const { discordWebhookUrl } = getAlertSettings();
	const client = new DiscordWebhookClient(discordWebhookUrl);

	for (const record of event.Records) {
		await client.postMessage(buildAlarmReport(record.Sns.Message));
	}

	logger.complete({ recordCount: event.Records.length });
};
