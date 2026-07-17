// In scope: /hello コマンドから返す interaction callback payload を解決する
// Out of scope: interaction 種別・コマンドのルーティング、payload の構造定義、HTTP response の形成
import {
	buildInteractionResponse,
	type DiscordInteractionResponsePayload,
} from "@/external-protocols/discord-message/build.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/** /hello コマンドのコマンド名。Discord へのコマンド登録と一致させる。 */
export const HELLO_COMMAND_NAME = "hello";

/** /hello コマンドから返す interaction callback payload を解決する。 */
export const resolveHelloCommand =
	(): OperationResult<DiscordInteractionResponsePayload> => {
		return {
			kind: "OK",
			data: buildInteractionResponse({
				kind: "channel-message",
				content: "やおよろ～🌚",
			}),
		};
	};
