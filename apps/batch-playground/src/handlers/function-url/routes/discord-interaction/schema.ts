// In scope: Function URL event から Discord 署名検証に必要な値を取り出す
// Out of scope: Discord interaction body の parse、署名検証、operation の選択、応答 body の生成
import { z } from "zod";

/** Function URL event からDiscord署名検証に必要なrequest値を取り出すschema。 */
export const discordInteractionRequestSchema = z
	.object({
		headers: z.record(z.string(), z.string()),
		body: z.string().optional(),
		isBase64Encoded: z.boolean().optional(),
	})
	.transform(({ headers, body, isBase64Encoded }) => {
		return {
			signature: headers["x-signature-ed25519"] ?? "",
			timestamp: headers["x-signature-timestamp"] ?? "",
			rawBody: isBase64Encoded
				? Buffer.from(body ?? "", "base64").toString("utf8")
				: (body ?? ""),
		};
	});
