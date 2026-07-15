// In scope: Function URL Lambda の起動イベント・interaction body の外部入力 schema と型、HTTP レスポンスの型を提供する
// Out of scope: 署名検証、選択結果の判定、応答 body の組み立てを行う
import { z } from "zod";

/** Function URL Lambda が受け取る Lambda Function URL イベント schema。rawPath で job を振り分ける。 */
export const functionUrlEventSchema = z.object({
	rawPath: z.string(),
	headers: z.record(z.string(), z.string()),
	body: z.string().optional(),
	isBase64Encoded: z.boolean().optional(),
});

/** Function URL Lambda が受け取る Lambda Function URL イベント。 */
export type FunctionUrlEvent = z.infer<typeof functionUrlEventSchema>;

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

/** job の失敗理由。HTTP status への対応づけは handler が行う。 */
export type FunctionUrlJobError = "unauthorized" | "invalid-request";

/** job の内部処理結果。成功時は応答 payload、失敗時は失敗理由を持つ。 */
export type FunctionUrlJobResult =
	| { ok: true; body: unknown }
	| { ok: false; error: FunctionUrlJobError };

/** Function URL Lambda が Lambda Function URL へ返す HTTP レスポンス。 */
export interface FunctionUrlResponse {
	statusCode: number;
	headers: Record<string, string>;
	body: string;
}
