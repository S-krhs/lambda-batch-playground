// In scope: Function URL の公開エンドポイントとして envelope を検証し、リクエストパスから担当 job へ委譲し、結果を HTTP レスポンスへ組み立てる
// Out of scope: 署名検証、interaction 内容の解釈、応答 payload の中身を持つ
import { discordInteractionJob } from "./jobs/discord-interaction.js";
import {
	type FunctionUrlEvent,
	type FunctionUrlJobError,
	type FunctionUrlJobResult,
	type FunctionUrlResponse,
	functionUrlEventSchema,
} from "./schema.js";

/** Function URL のリクエストを受け取り成功/失敗の結果を返す job。 */
type FunctionUrlJob = (
	event: FunctionUrlEvent,
) => Promise<FunctionUrlJobResult>;

/** リクエストパスと担当 job の対応。job を追加したらここへ登録する(例: "/slack/events")。 */
const jobsByPath = new Map<string, FunctionUrlJob>([
	["/discord/interactions", discordInteractionJob],
]);

/** job の失敗理由を HTTP status とメッセージへ対応づける。 */
const errorResponses: Record<
	FunctionUrlJobError,
	{ statusCode: number; message: string }
> = {
	unauthorized: { statusCode: 401, message: "署名が不正です。" },
	"invalid-request": { statusCode: 400, message: "リクエストが不正です。" },
};

const httpResponse = (
	statusCode: number,
	body: unknown,
): FunctionUrlResponse => {
	return {
		statusCode,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
};

/** Lambda Function URL のエントリポイント。envelope を検証し、パスに対応する job の結果を HTTP レスポンスへ組み立てる。 */
export const handler = async (
	event: unknown = {},
): Promise<FunctionUrlResponse> => {
	const parsedEvent = functionUrlEventSchema.safeParse(event);

	if (!parsedEvent.success) {
		return httpResponse(400, { error: "リクエストの形式が不正です。" });
	}

	const job = jobsByPath.get(parsedEvent.data.rawPath);

	if (!job) {
		return httpResponse(404, { error: "対応していないパスです。" });
	}

	const result = await job(parsedEvent.data);

	if (result.ok) {
		return httpResponse(200, result.body);
	}

	const { statusCode, message } = errorResponses[result.error];
	return httpResponse(statusCode, { error: message });
};
