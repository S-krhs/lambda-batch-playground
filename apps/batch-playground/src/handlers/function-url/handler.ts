// In scope: Function URL の公開エンドポイントとして envelope を検証し、リクエストパスから担当 job へ委譲する
// Out of scope: 署名検証、interaction 内容の解釈、応答 payload 作成の詳細を持つ
import { discordInteractionJob } from "./jobs/discord-interaction.js";
import {
	type FunctionUrlEvent,
	type FunctionUrlResponse,
	functionUrlEventSchema,
} from "./schema.js";

/** Function URL のリクエストを受け取り応答を返す job。 */
type FunctionUrlJob = (event: FunctionUrlEvent) => Promise<FunctionUrlResponse>;

/** リクエストパスと担当 job の対応。job を追加したらここへ登録する(例: "/slack/events")。 */
const jobsByPath = new Map<string, FunctionUrlJob>([
	["/discord/interactions", discordInteractionJob],
]);

const jsonResponse = (
	statusCode: number,
	body: unknown,
): FunctionUrlResponse => {
	return {
		statusCode,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
};

/** Lambda Function URL のエントリポイント。envelope を検証し、パスに対応する job へ委譲する。 */
export const handler = async (
	event: unknown = {},
): Promise<FunctionUrlResponse> => {
	const parsedEvent = functionUrlEventSchema.safeParse(event);

	if (!parsedEvent.success) {
		return jsonResponse(400, { error: "リクエストの形式が不正です。" });
	}

	const job = jobsByPath.get(parsedEvent.data.rawPath);

	if (!job) {
		return jsonResponse(404, { error: "対応していないパスです。" });
	}

	return job(parsedEvent.data);
};
