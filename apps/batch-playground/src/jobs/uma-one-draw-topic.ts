// In scope: UMA ワンドロのお題通知バッチをオーケストレーションする
// Out of scope: お題メッセージ生成や Discord Webhook HTTP 通信の詳細を持つ
import { DiscordWebhookClient } from "@eskra-aws-playground/integration-discord/discord-webhook-client.js";

import { buildTopicMessage } from "../features/uma-one-draw-topic/topic-message.js";
import type {
	BatchHandler,
	BatchResponse,
	LambdaEvent,
} from "../shared/infra/lambda.js";
import { resolveSecrets } from "../shared/infra/secrets.js";
import { batchNames } from "../shared/routes/batch-names.js";

/** UMA ワンドロのお題を Discord へ通知するバッチジョブ。 */
export const umaOneDrawTopicJob: BatchHandler = async (
	_event: LambdaEvent,
): Promise<BatchResponse> => {
	// 1. 設定から送信先 Discord Webhook URL を取得する。
	const { discordWebhookUrl } = resolveSecrets();

	console.log("UMA ワンドロお題通知 送信開始");

	// 2. feature で UMA ワンドロのお題メッセージを生成する。
	const message = buildTopicMessage();

	// 3. Discord Webhook integration へ送信を委譲する。
	const webhookClient = new DiscordWebhookClient(discordWebhookUrl);
	await webhookClient.postMessage(message.content);

	console.log("UMA ワンドロお題通知 送信完了");

	// 4. Lambda ハンドラーへ共通レスポンスを返す。
	return {
		ok: true,
		job: batchNames.umaOneDrawTopic,
		details: {
			messageLength: message.content.length,
		},
	};
};
