// In scope: /inuihiroshi command から返す interaction callback payload の生成
// Out of scope: command routing、payload構造定義、HTTP response の形成
import {
	type DiscordChannelMessageResponsePayload,
	responseTypes,
} from "@/external-protocols/discord-message/interaction-response.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/** /inuihiroshi command へ自由を宣言するメッセージを返す。 */
export const inuihiroshiCommandOperation =
	(): OperationResult<DiscordChannelMessageResponsePayload> => {
		return {
			kind: "OK",
			data: {
				type: responseTypes.message,
				data: {
					content: "自由だ～～～～！！！！！！！",
					allowed_mentions: { parse: [] },
				},
			},
		};
	};
