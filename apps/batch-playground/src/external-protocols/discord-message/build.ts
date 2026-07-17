// In scope: 選択肢メッセージと interaction callback の Discord payload を build する
// Out of scope: interaction body の parse、custom_id の解釈、署名検証、HTTP 通信
import {
	CUSTOM_ID_SEPARATOR,
	DISCORD_BUTTON_STYLES,
	type DiscordChoiceDefinition,
} from "./choice.js";

const RESPONSE_TYPE_PONG = 1;
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4;
const RESPONSE_TYPE_UPDATE_MESSAGE = 7;
const RESPONSE_TYPE_AUTOCOMPLETE_RESULT = 8;
const MESSAGE_FLAG_EPHEMERAL = 64;

/** Discord PONG interaction callback の payload。 */
export type DiscordPongResponsePayload = { type: 1 };

/** Discord channel message interaction callback の payload。 */
export type DiscordChannelMessageResponsePayload = {
	type: 4;
	data: {
		content: string;
		allowed_mentions: { parse: readonly string[] };
	};
};

/** Discord ephemeral interaction callback の payload。 */
export type DiscordEphemeralResponsePayload = {
	type: 4;
	data: {
		content: string;
		flags: 64;
		allowed_mentions: { parse: readonly string[] };
	};
};

/** Discord message update interaction callback の payload。 */
export type DiscordUpdateMessageResponsePayload = {
	type: 7;
	data: {
		content: string;
		components: readonly [];
		allowed_mentions: { parse: readonly string[] };
	};
};

/** 空の Discord autocomplete interaction callback の payload。 */
export type DiscordEmptyAutocompleteResponsePayload = {
	type: 8;
	data: { choices: readonly [] };
};

/** Discord interaction callback の payload。 */
export type DiscordInteractionResponsePayload =
	| DiscordPongResponsePayload
	| DiscordChannelMessageResponsePayload
	| DiscordEphemeralResponsePayload
	| DiscordUpdateMessageResponsePayload
	| DiscordEmptyAutocompleteResponsePayload;

/** 対象ユーザーをメンションしたテキストメッセージ payload を構築する。 */
export const buildMentionMessage = (targetUserId: string, text: string) => {
	return {
		content: `<@${targetUserId}> ${text}`,
		allowed_mentions: { parse: [] as readonly string[], users: [targetUserId] },
	};
};

/** 選択肢定義からボタンのみの Discord channel message payload を構築する。 */
export const buildChoiceButtonsMessage = (
	targetUserId: string,
	definition: DiscordChoiceDefinition,
) => {
	return {
		components: [
			{
				type: 1 as const,
				components: definition.choices.map((choice) => {
					return {
						type: 2 as const,
						style: DISCORD_BUTTON_STYLES[choice.tone],
						label: choice.label,
						custom_id: [
							definition.customIdPrefix,
							targetUserId,
							choice.id,
						].join(CUSTOM_ID_SEPARATOR),
					};
				}),
			},
		],
		allowed_mentions: { parse: [] as readonly string[] },
	};
};

/** Discord PONG interaction callback を構築する。 */
export const buildPongResponse = (): DiscordPongResponsePayload => {
	return { type: RESPONSE_TYPE_PONG };
};

/** 元の Discord message を更新する interaction callback を構築する。 */
export const buildUpdateMessageResponse = (
	content: string,
): DiscordUpdateMessageResponsePayload => {
	return {
		type: RESPONSE_TYPE_UPDATE_MESSAGE,
		data: {
			content,
			components: [],
			allowed_mentions: { parse: [] },
		},
	};
};

/** Discord channel message interaction callback を構築する。 */
export const buildChannelMessageResponse = (
	content: string,
): DiscordChannelMessageResponsePayload => {
	return {
		type: RESPONSE_TYPE_CHANNEL_MESSAGE,
		data: {
			content,
			allowed_mentions: { parse: [] },
		},
	};
};

/** Discord ephemeral interaction callback を構築する。 */
export const buildEphemeralResponse = (
	content: string,
): DiscordEphemeralResponsePayload => {
	return {
		type: RESPONSE_TYPE_CHANNEL_MESSAGE,
		data: {
			content,
			flags: MESSAGE_FLAG_EPHEMERAL,
			allowed_mentions: { parse: [] },
		},
	};
};

/** 空の Discord autocomplete interaction callback を構築する。 */
export const buildEmptyAutocompleteResponse =
	(): DiscordEmptyAutocompleteResponsePayload => {
		return {
			type: RESPONSE_TYPE_AUTOCOMPLETE_RESULT,
			data: { choices: [] },
		};
	};
