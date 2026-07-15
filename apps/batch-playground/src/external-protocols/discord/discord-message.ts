// In scope: Discord message / interaction payload の parse・build と custom_id の解釈
// Out of scope: HTTP 通信、署名検証、業務ルール、Function URL response の構築

const DISCORD_BUTTON_STYLES = {
	primary: 1,
	neutral: 2,
	positive: 3,
	negative: 4,
} as const;

const RESPONSE_TYPE_PONG = 1;
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4;
const RESPONSE_TYPE_UPDATE_MESSAGE = 7;
const RESPONSE_TYPE_AUTOCOMPLETE_RESULT = 8;
const MESSAGE_FLAG_EPHEMERAL = 64;
const CUSTOM_ID_SEPARATOR = ":";

/** Discord interaction type。 */
export const DISCORD_INTERACTION_TYPES = {
	PING: 1,
	MESSAGE_COMPONENT: 3,
	APPLICATION_COMMAND_AUTOCOMPLETE: 4,
} as const;

/** Discord button の意味的な表示種別。 */
export type DiscordButtonTone = keyof typeof DISCORD_BUTTON_STYLES;

/** 選択肢メッセージの custom_id とボタン表示に必要な定義。 */
export interface DiscordChoiceDefinition {
	customIdPrefix: string;
	choices: readonly {
		id: string;
		label: string;
		tone: DiscordButtonTone;
	}[];
}

/** Discord へ投稿する選択肢メッセージ。 */
export interface DiscordChoiceMessage extends DiscordChoiceDefinition {
	prompt: string;
}

/** Parse 済み Discord interaction。 */
export interface DiscordInteraction {
	type: number;
	customId?: string;
	pressedUserId?: string;
}

/** Discord interaction のボタン選択情報。 */
export interface DiscordChoiceSelection {
	choiceId: string;
	choiceLabel: string;
	pressedUserId: string;
	targetUserId: string;
}

/** Discord interaction callback の生成指示。 */
export type DiscordInteractionResponse =
	| { kind: "pong" }
	| { kind: "update-message"; content: string }
	| { kind: "ephemeral"; content: string }
	| { kind: "empty-autocomplete" };

/** Discord interaction callback の payload。 */
export type DiscordInteractionResponsePayload =
	| { type: 1 }
	| {
			type: 4;
			data: {
				content: string;
				flags: 64;
				allowed_mentions: { parse: readonly string[] };
			};
	  }
	| {
			type: 7;
			data: {
				content: string;
				components: readonly [];
				allowed_mentions: { parse: readonly string[] };
			};
	  }
	| { type: 8; data: { choices: readonly [] } };

interface DiscordInteractionData {
	type: number;
	data?: { custom_id?: string };
	member?: { user?: { id: string } };
	user?: { id: string };
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isOptionalUser = (value: unknown): boolean => {
	if (value === undefined) {
		return true;
	}

	return isRecord(value) && typeof value.id === "string";
};

const isDiscordInteractionData = (
	value: unknown,
): value is DiscordInteractionData => {
	if (!isRecord(value) || typeof value.type !== "number") {
		return false;
	}

	if (
		value.data !== undefined &&
		(!isRecord(value.data) ||
			(value.data.custom_id !== undefined &&
				typeof value.data.custom_id !== "string"))
	) {
		return false;
	}

	if (
		value.member !== undefined &&
		(!isRecord(value.member) || !isOptionalUser(value.member.user))
	) {
		return false;
	}

	return isOptionalUser(value.user);
};

/** 選択肢定義から Discord channel message payload を構築する。 */
export const buildChoiceMessage = (
	targetUserId: string,
	message: DiscordChoiceMessage,
) => {
	return {
		content: `<@${targetUserId}> ${message.prompt}`,
		components: [
			{
				type: 1 as const,
				components: message.choices.map((choice) => {
					return {
						type: 2 as const,
						style: DISCORD_BUTTON_STYLES[choice.tone],
						label: choice.label,
						custom_id: [message.customIdPrefix, targetUserId, choice.id].join(
							CUSTOM_ID_SEPARATOR,
						),
					};
				}),
			},
		],
		allowed_mentions: { parse: [] as readonly string[], users: [targetUserId] },
	};
};

/** JSON body を Discord interaction として parse する。 */
export const parseInteraction = (
	rawBody: string,
): DiscordInteraction | undefined => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(rawBody) as unknown;
	} catch {
		return undefined;
	}

	if (!isDiscordInteractionData(parsed)) {
		return undefined;
	}

	return {
		type: parsed.type,
		customId: parsed.data?.custom_id,
		pressedUserId: parsed.member?.user?.id ?? parsed.user?.id,
	};
};

/** Parse 済み interaction と送信時の定義からボタン選択情報を解決する。 */
export const resolveChoice = (
	interaction: DiscordInteraction,
	definition: DiscordChoiceDefinition,
): DiscordChoiceSelection | undefined => {
	if (!interaction.customId || !interaction.pressedUserId) {
		return undefined;
	}

	const parts = interaction.customId.split(CUSTOM_ID_SEPARATOR);
	if (parts.length !== 3) {
		return undefined;
	}

	const [customIdPrefix, targetUserId, choiceId] = parts;
	if (customIdPrefix !== definition.customIdPrefix || !targetUserId) {
		return undefined;
	}

	const choice = definition.choices.find((candidate) => {
		return candidate.id === choiceId;
	});
	if (!choice) {
		return undefined;
	}

	return {
		choiceId: choice.id,
		choiceLabel: choice.label,
		pressedUserId: interaction.pressedUserId,
		targetUserId,
	};
};

/** Discord interaction callback の生成指示から payload を構築する。 */
export const buildInteractionResponse = (
	response: DiscordInteractionResponse,
): DiscordInteractionResponsePayload => {
	switch (response.kind) {
		case "pong":
			return { type: RESPONSE_TYPE_PONG };
		case "update-message":
			return {
				type: RESPONSE_TYPE_UPDATE_MESSAGE,
				data: {
					content: response.content,
					components: [],
					allowed_mentions: { parse: [] },
				},
			};
		case "ephemeral":
			return {
				type: RESPONSE_TYPE_CHANNEL_MESSAGE,
				data: {
					content: response.content,
					flags: MESSAGE_FLAG_EPHEMERAL,
					allowed_mentions: { parse: [] },
				},
			};
		case "empty-autocomplete":
			return {
				type: RESPONSE_TYPE_AUTOCOMPLETE_RESULT,
				data: { choices: [] },
			};
	}
};
