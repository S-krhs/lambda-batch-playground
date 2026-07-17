// In scope: Discord interaction body の JSON 構文解析と構造検証
// Out of scope: custom_id の機能固有な解釈、署名検証、業務ルール、HTTP 通信
import { z } from "zod";

/** Discord interaction type。 */
export const DISCORD_INTERACTION_TYPES = {
	PING: 1,
	APPLICATION_COMMAND: 2,
	MESSAGE_COMPONENT: 3,
	APPLICATION_COMMAND_AUTOCOMPLETE: 4,
} as const;

/** Parse 済み Discord interaction。 */
export interface DiscordInteraction {
	type: number;
	commandName?: string;
	customId?: string;
	pressedUserId?: string;
}

const interactionBodySchema = z.object({
	type: z.number(),
	data: z
		.object({ name: z.string().optional(), custom_id: z.string().optional() })
		.optional(),
	member: z
		.object({ user: z.object({ id: z.string() }).optional() })
		.optional(),
	user: z.object({ id: z.string() }).optional(),
});

/** JSON body を Discord interaction として parse する。 */
export const parseInteraction = (
	rawBody: string,
): DiscordInteraction | undefined => {
	// JSON 文字列の構文解析は JSON.parse、parse 後の構造検証は Zod が担当する。
	let json: unknown;
	try {
		json = JSON.parse(rawBody) as unknown;
	} catch {
		return undefined;
	}

	const parsed = interactionBodySchema.safeParse(json);
	if (!parsed.success) {
		return undefined;
	}

	return {
		type: parsed.data.type,
		commandName: parsed.data.data?.name,
		customId: parsed.data.data?.custom_id,
		pressedUserId: parsed.data.member?.user?.id ?? parsed.data.user?.id,
	};
};
