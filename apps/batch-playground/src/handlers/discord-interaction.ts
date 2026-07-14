// In scope: Discord interaction の Lambda Function URL イベントを受け取り、interaction ジョブへ実行を委譲する
// Out of scope: 署名検証、interaction の解釈、応答 payload 作成の詳細を持つ
import { discordInteractionJob } from "../jobs/discord-interaction.js";
import type { DiscordInteractionResponse } from "../shared/schemas/lambda/discord-interaction/response.js";

/** Discord interaction 用 Lambda のエントリポイント。 */
export const handler = async (
	event: unknown = {},
): Promise<DiscordInteractionResponse> => {
	return discordInteractionJob(event);
};
