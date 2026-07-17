// In scope: Discord autocomplete interaction へ返す callback payload の生成
// Out of scope: interaction 種別のルーティング、候補の検索、HTTP response の形成
import {
	DISCORD_INTERACTION_CALLBACK_TYPES,
	type DiscordEmptyAutocompleteResponsePayload,
} from "@/external-protocols/discord-message/interaction-response.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";

/** Discord autocomplete interaction へ返す空の候補一覧を生成する。 */
export const autocompleteOperation =
	(): OperationResult<DiscordEmptyAutocompleteResponsePayload> => {
		return {
			kind: "OK",
			data: {
				type: DISCORD_INTERACTION_CALLBACK_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
				data: { choices: [] },
			},
		};
	};
