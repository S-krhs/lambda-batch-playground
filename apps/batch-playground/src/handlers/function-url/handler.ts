// In scope: Function URL の公開エンドポイントとして起動イベントの envelope を検証し、担当 job へ委譲する
// Out of scope: 署名検証、interaction 内容の解釈、応答 payload 作成の詳細を持つ
import { discordInteractionJob } from "./jobs/discord-interaction.js";
import { type FunctionUrlResponse, functionUrlEventSchema } from "./schema.js";

/** Lambda Function URL のエントリポイント。envelope を検証し担当 job へ委譲する。 */
export const handler = async (
	event: unknown = {},
): Promise<FunctionUrlResponse> => {
	const parsedEvent = functionUrlEventSchema.safeParse(event);

	if (!parsedEvent.success) {
		return {
			statusCode: 400,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "リクエストの形式が不正です。" }),
		};
	}

	return discordInteractionJob(parsedEvent.data);
};
