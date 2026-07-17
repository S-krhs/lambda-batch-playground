import { describe, expect, it } from "vitest";

import { parseInteraction } from "@/external-protocols/discord-message/parse.js";
import { resolveReminderChoice } from "./resolve-reminder-choice.js";

const resolve = (customId: string, pressedUserId: string) => {
	const interaction = parseInteraction(
		JSON.stringify({
			type: 3,
			data: { custom_id: customId },
			user: { id: pressedUserId },
		}),
	);
	if (!interaction) {
		throw new Error("test interaction の parse に失敗しました");
	}

	return resolveReminderChoice(interaction);
};

describe("resolveReminderChoice", () => {
	it("対象ユーザーの選択には OK と元メッセージを更新する payload を返す", () => {
		expect(resolve("play-check-reminder:123:won", "123")).toEqual({
			kind: "OK",
			data: {
				type: 7,
				data: {
					content: "でれれれれれ～、**はい（勝った）**！",
					components: [],
					allowed_mentions: { parse: [] },
				},
			},
		});
	});

	it("対象外ユーザーには FORBIDDEN と専用メッセージ payload を返す", () => {
		expect(resolve("play-check-reminder:123:won", "999")).toEqual({
			kind: "FORBIDDEN",
			data: {
				type: 4,
				data: {
					content:
						"このリマインダーは <@123> さんしか使えないのです～、よよよ……",
					flags: 64,
					allowed_mentions: { parse: [] },
				},
			},
		});
	});

	it("リマインダーの選択と解釈できない interaction には undefined を返す", () => {
		expect(resolve("unknown:payload", "123")).toBeUndefined();
		expect(resolve("play-check-reminder:123:unknown", "123")).toBeUndefined();
	});
});
