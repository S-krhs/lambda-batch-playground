// In scope: interaction ジョブ message を SQS へ投入するための queue URL 解決と送信
// Out of scope: message の組み立て、deferred ack の生成、ジョブの実行内容を持つ
import { SqsMessageSender } from "@eskra-aws-playground/integration-sqs/sqs-message-sender.js";
import { Resource } from "sst/resource";
import type { InteractionJobMessage } from "@/features/interaction-job/queue-message.js";

/**
 * deferred 応答後に処理する interaction ジョブ message を SQS へ投入する。
 * queue URL は SST link から解決し、1 interaction につき 1 message を送る。
 */
export const enqueueInteractionJob = async (
	message: InteractionJobMessage,
): Promise<void> => {
	const sender = new SqsMessageSender(Resource.PlaygroundInteractionQueue.url);
	await sender.sendMessages([{ id: "interaction-job", body: message }]);
};
