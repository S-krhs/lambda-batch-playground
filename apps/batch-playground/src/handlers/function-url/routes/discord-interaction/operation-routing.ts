// In scope: Discord interaction をフラットな route 定義と照合して operation を選択する
// Out of scope: operation の実行、未対応時の fallback、HTTP response の形成
import type { DiscordInteractionResponsePayload } from "@/external-protocols/discord-message/interaction-response.js";
import {
	DISCORD_INTERACTION_TYPES,
	type DiscordInteraction,
} from "@/external-protocols/discord-message/parse.js";
import { REMINDER_CUSTOM_ID_PREFIX } from "@/features/play-check-reminder/reminder-settings.js";
import type { OperationResult } from "@/handlers/function-url/routes/intermediate-models/operation-result.js";
import { COMMAND_DEFINITIONS } from "./command-definitions.js";
import { autocompleteOperation } from "./operations/autocomplete-operation.js";
import { helloCommandOperation } from "./operations/hello-command-operation.js";
import { pingOperation } from "./operations/ping-operation.js";
import { playCheckReminderOperation } from "./operations/play-check-reminder-operation.js";

type DiscordInteractionOperation = (
	interaction: DiscordInteraction,
) => OperationResult<DiscordInteractionResponsePayload> | undefined;

interface OperationRoute {
	matches(interaction: DiscordInteraction): boolean;
	operation: DiscordInteractionOperation;
}

const operationRoutes = new Map<string, OperationRoute>([
	[
		"ping",
		{
			matches: (interaction) => {
				return interaction.type === DISCORD_INTERACTION_TYPES.PING;
			},
			operation: pingOperation,
		},
	],
	[
		"autocomplete",
		{
			matches: (interaction) => {
				return (
					interaction.type ===
					DISCORD_INTERACTION_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE
				);
			},
			operation: autocompleteOperation,
		},
	],
	[
		"hello-command",
		{
			matches: (interaction) => {
				return (
					interaction.type === DISCORD_INTERACTION_TYPES.APPLICATION_COMMAND &&
					interaction.commandName === COMMAND_DEFINITIONS.hello.commandName
				);
			},
			operation: helloCommandOperation,
		},
	],
	[
		"play-check-reminder-message",
		{
			matches: (interaction) => {
				return (
					interaction.type === DISCORD_INTERACTION_TYPES.MESSAGE_COMPONENT &&
					(interaction.customId?.startsWith(`${REMINDER_CUSTOM_ID_PREFIX}:`) ??
						false)
				);
			},
			operation: playCheckReminderOperation,
		},
	],
]);

/** interaction に一致するフラットな route 定義の operation を返す。 */
export const findInteractionOperation = (
	interaction: DiscordInteraction,
): DiscordInteractionOperation | undefined => {
	for (const route of operationRoutes.values()) {
		if (route.matches(interaction)) {
			return route.operation;
		}
	}

	return undefined;
};
