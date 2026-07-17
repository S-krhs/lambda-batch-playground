// In scope: Discord API への JSON 送信(POST/PUT)の timeout 制御・応答検査・エラー整形を共通化する
// Out of scope: 各 API 固有の URL 組み立て、認証情報の解決、payload 生成を行う
import {
	sanitizeText,
	type TextReplacement,
} from "@eskra-aws-playground/libs/string/text-sanitizer.js";

/** JSON 送信の失敗応答の安全化済み詳細。 */
export interface JsonResponseDetails {
	status: number;
	body: string;
}

/** JSON 送信の実行に必要な入力。 */
export interface JsonSendRequest {
	url: string;
	/** HTTP メソッド。一覧の総入れ替えなど冪等な更新には PUT を使う。 */
	method: "POST" | "PUT";
	headers?: Record<string, string>;
	payload: unknown;
	timeoutMs: number;
	/** エラーメッセージの主語に使う API 名(例: "Discord Webhook")。 */
	apiLabel: string;
	/** 失敗応答 body へ適用する秘匿置換。 */
	responseBodyReplacements?: readonly TextReplacement[];
	/** この API 固有のエラー型を作る。 */
	createError: (message: string, responseDetails?: unknown) => Error;
}

/** JSON payload を timeout 付きで送信し、失敗を API 固有のエラーにして投げる。 */
export const sendJson = async (request: JsonSendRequest): Promise<void> => {
	const {
		url,
		method,
		headers = {},
		payload,
		timeoutMs,
		apiLabel,
		responseBodyReplacements = [],
		createError,
	} = request;

	if (typeof globalThis.fetch !== "function") {
		throw createError("ランタイムに fetch がありません");
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		controller.abort();
	}, timeoutMs);

	let response: Response;
	try {
		response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw createError(
				`${apiLabel} リクエストがタイムアウトしました: ${timeoutMs}ms`,
				{
					timeoutMs,
				},
			);
		}

		throw error;
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		const responseDetails: JsonResponseDetails = {
			status: response.status,
			body: sanitizeText(await response.text(), {
				replacements: responseBodyReplacements,
			}),
		};

		throw createError(
			`${apiLabel} 応答が失敗しました: ${response.status}`,
			responseDetails,
		);
	}
};
