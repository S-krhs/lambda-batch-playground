// In scope: /hello を deferred 応答で ACK し、公開あいさつを送る後追いジョブを enqueue する
// Out of scope: interaction 種別・コマンドのルーティング、あいさつ本文の生成、HTTP response の形成
import {
	type DiscordDeferredMessageResponsePayload,
	responseTypes,
} from "@/external-protocols/discord-message/interaction-response.js";
import type { DiscordInteractionCallback } from "@/external-protocols/discord-message/parse.js";
import { interactionJobNames } from "@/features/interaction-job/job-names.js";
import { enqueueInteractionJob } from "@/handlers/function-url/interaction-job/enqueue.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/** /hello を公開の deferred 応答で ACK し、あいさつ本文の送信を後追いジョブへ委譲する。 */
export const helloCommandOperation = async (
	callback: DiscordInteractionCallback,
): Promise<OperationResult<DiscordDeferredMessageResponsePayload>> => {
	await enqueueInteractionJob({
		job: interactionJobNames.yacchoHelloReply,
		applicationId: callback.applicationId,
		token: callback.token,
	});

	return { kind: "OK", data: { type: responseTypes.deferredMessage } };
};
