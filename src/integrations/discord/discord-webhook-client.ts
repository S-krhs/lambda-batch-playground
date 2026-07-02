// やること: 指定された Discord Webhook URL へ HTTP リクエストを送信する
// やらないこと: Webhook URL の解決、メッセージ内容の生成、ジョブ判定を行う

/** Discord Webhook API に送る payload。 */
export interface DiscordPayload {
	content: string;
	allowed_mentions: {
		parse: readonly string[];
	};
}

/** Discord Webhook のテキスト送信時に上書きできるオプション。 */
export interface DiscordMessageOptions {
	allowed_mentions?: {
		parse: readonly string[];
	};
}

/** Discord Webhook 連携で発生した失敗を表すエラー。 */
export class DiscordWebhookError extends Error {
	public readonly responseDetails: unknown | null;

	constructor(message: string, responseDetails: unknown | null = null) {
		super(message);
		this.name = "DiscordWebhookError";
		this.responseDetails = responseDetails;
	}
}

/** Discord Webhook URL への送信を担当するクライアント。 */
export class DiscordWebhookClient {
	private readonly webhookUrl: string;

	constructor(webhookUrl: string) {
		this.webhookUrl = webhookUrl;
	}

	/** Discord Webhook API へ payload を POST する。 */
	private async post(payload: DiscordPayload): Promise<void> {
		if (typeof globalThis.fetch !== "function") {
			throw new DiscordWebhookError("ランタイムに fetch がありません");
		}

		const response = await fetch(this.webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new DiscordWebhookError(
				`Discord Webhook 応答が失敗しました: ${response.status} ${text}`,
				{
					status: response.status,
					body: text,
				},
			);
		}
	}

	/** テキスト本文を Discord Webhook API へ送信する。 */
	public async postMessage(
		content: string,
		options: DiscordMessageOptions = {},
	): Promise<void> {
		await this.post({
			content,
			allowed_mentions: options.allowed_mentions ?? {
				parse: [],
			},
		});
	}
}
