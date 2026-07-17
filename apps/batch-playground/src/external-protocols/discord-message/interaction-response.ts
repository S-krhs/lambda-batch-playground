// In scope: Discord interaction callback の type・flag・payload 型
// Out of scope: callback payload の生成、メッセージ内容の決定、HTTP response の形成

/** Discord interaction callback type。 */
export const DISCORD_INTERACTION_CALLBACK_TYPES = {
	PONG: 1,
	CHANNEL_MESSAGE_WITH_SOURCE: 4,
	UPDATE_MESSAGE: 7,
	APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
} as const;

/** Discord message flag。 */
export const DISCORD_MESSAGE_FLAGS = {
	EPHEMERAL: 64,
} as const;

/** Discord PONG interaction callback の payload。 */
export type DiscordPongResponsePayload = {
	type: typeof DISCORD_INTERACTION_CALLBACK_TYPES.PONG;
};

/** Discord channel message interaction callback の payload。 */
export type DiscordChannelMessageResponsePayload = {
	type: typeof DISCORD_INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
	data: {
		content: string;
		allowed_mentions: { parse: readonly string[] };
	};
};

/** Discord ephemeral interaction callback の payload。 */
export type DiscordEphemeralResponsePayload = {
	type: typeof DISCORD_INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
	data: {
		content: string;
		flags: typeof DISCORD_MESSAGE_FLAGS.EPHEMERAL;
		allowed_mentions: { parse: readonly string[] };
	};
};

/** Discord message update interaction callback の payload。 */
export type DiscordUpdateMessageResponsePayload = {
	type: typeof DISCORD_INTERACTION_CALLBACK_TYPES.UPDATE_MESSAGE;
	data: {
		content: string;
		components: readonly [];
		allowed_mentions: { parse: readonly string[] };
	};
};

/** 空の Discord autocomplete interaction callback の payload。 */
export type DiscordEmptyAutocompleteResponsePayload = {
	type: typeof DISCORD_INTERACTION_CALLBACK_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT;
	data: { choices: readonly [] };
};

/** Discord interaction callback の payload。 */
export type DiscordInteractionResponsePayload =
	| DiscordPongResponsePayload
	| DiscordChannelMessageResponsePayload
	| DiscordEphemeralResponsePayload
	| DiscordUpdateMessageResponsePayload
	| DiscordEmptyAutocompleteResponsePayload;
