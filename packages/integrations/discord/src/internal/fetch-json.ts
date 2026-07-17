// In scope: Discord API への JSON GET の timeout 制御・応答検査・エラー整形を共通化し、parse した body を返す
// Out of scope: 各 API 固有の URL 組み立て、認証情報の解決、応答の意味解釈を行う
import {
	sanitizeText,
	type TextReplacement,
} from "@eskra-aws-playground/libs/string/text-sanitizer.js";

/** JSON GET の実行に必要な入力。 */
export interface JsonFetchRequest {
	url: string;
	headers?: Record<string, string>;
	timeoutMs: number;
	/** エラーメッセージの主語に使う API 名(例: "Discord Command API")。 */
	apiLabel: string;
	/** 失敗応答 body へ適用する秘匿置換。 */
	responseBodyReplacements?: readonly TextReplacement[];
	/** この API 固有のエラー型を作る。 */
	createError: (message: string, responseDetails?: unknown) => Error;
}

/** JSON を timeout 付きで GET し、parse した body を返す。失敗は API 固有のエラーにして投げる。 */
export const fetchJson = async <T>(request: JsonFetchRequest): Promise<T> => {
	const {
		url,
		headers = {},
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
			method: "GET",
			headers,
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
		throw createError(`${apiLabel} 応答が失敗しました: ${response.status}`, {
			status: response.status,
			body: sanitizeText(await response.text(), {
				replacements: responseBodyReplacements,
			}),
		});
	}

	return (await response.json()) as T;
};
