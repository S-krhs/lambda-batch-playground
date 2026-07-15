// In scope: discord-interaction Lambda が返す HTTP レスポンスの型を提供する
// Out of scope: 起動イベントの検証、署名検証、応答 body の組み立てを行う

/** discord-interaction Lambda が Lambda Function URL へ返す HTTP レスポンス。 */
export interface DiscordInteractionResponse {
	statusCode: number;
	headers: Record<string, string>;
	body: string;
}
