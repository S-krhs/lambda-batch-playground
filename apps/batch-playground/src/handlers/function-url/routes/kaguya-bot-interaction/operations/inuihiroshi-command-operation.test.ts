import { describe, expect, it } from "vitest";
import { inuihiroshiCommandOperation } from "./inuihiroshi-command-operation.js";

describe("inuihiroshiCommandOperation", () => {
	it("自由を宣言するメッセージ payload を返す", () => {
		expect(inuihiroshiCommandOperation()).toEqual({
			kind: "OK",
			data: {
				type: 4,
				data: {
					content: "自由だ～～～～！！！！！！！",
					allowed_mentions: { parse: [] },
				},
			},
		});
	});
});
