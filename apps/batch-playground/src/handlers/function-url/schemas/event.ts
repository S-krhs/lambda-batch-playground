// In scope: discord-interaction Lambda が受け取る起動イベントと interaction body の外部入力 schema と型を提供する
// Out of scope: 署名検証、選択結果の判定、応答生成を行う
import { z } from "zod";

/** discord-interaction Lambda が受け取る Lambda Function URL イベント schema。 */
export const discordInteractionFunctionUrlEventSchema = z.object({
	headers: z.record(z.string(), z.string()),
	body: z.string().optional(),
	isBase64Encoded: z.boolean().optional(),
});

/** discord-interaction Lambda が受け取る Lambda Function URL イベント。 */
export type DiscordInteractionFunctionUrlEvent = z.infer<
	typeof discordInteractionFunctionUrlEventSchema
>;

/** リクエストの生 body をパースした Discord interaction schema。 */
export const discordInteractionSchema = z.object({
	type: z.number(),
	data: z
		.object({
			custom_id: z.string().optional(),
		})
		.optional(),
	member: z
		.object({
			user: z
				.object({
					id: z.string(),
				})
				.optional(),
		})
		.optional(),
	user: z
		.object({
			id: z.string(),
		})
		.optional(),
});

/** リクエストの生 body をパースした Discord interaction。 */
export type DiscordInteraction = z.infer<typeof discordInteractionSchema>;
