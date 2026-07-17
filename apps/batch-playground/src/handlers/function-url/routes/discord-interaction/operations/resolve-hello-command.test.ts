import { describe, expect, it } from "vitest";

import { resolveHelloCommand } from "./resolve-hello-command.js";

describe("resolveHelloCommand", () => {
	it("OK と挨拶メッセージ payload を返す", () => {
		expect(resolveHelloCommand()).toEqual({
			kind: "OK",
			data: {
				type: 4,
				data: {
					content: "やおよろ～🌚",
					allowed_mentions: { parse: [] },
				},
			},
		});
	});
});
