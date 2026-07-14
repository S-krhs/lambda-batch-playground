import { describe, expect, it } from "vitest";

import { buildReminderMessage } from "./reminder-message.js";

describe("buildReminderMessage", () => {
	it("対象ユーザーへのメンションと質問文を content にする", () => {
		expect(buildReminderMessage("123456789012345678").content).toBe(
			"<@123456789012345678> 今日は遊技をしましたか？",
		);
	});

	it("3 つの選択肢を custom_id 形式 `play-check-reminder:<targetUserId>:<choiceId>` で並べる", () => {
		expect(buildReminderMessage("123").choices).toEqual([
			{
				customId: "play-check-reminder:123:won",
				label: "はい（勝った）",
				style: 3,
			},
			{
				customId: "play-check-reminder:123:lost",
				label: "はい（負けた）",
				style: 4,
			},
			{
				customId: "play-check-reminder:123:not-played",
				label: "いいえ",
				style: 2,
			},
		]);
	});

	it("対象ユーザー ID の前後空白を取り除く", () => {
		expect(buildReminderMessage(" 123 ").content).toBe(
			"<@123> 今日は遊技をしましたか？",
		);
	});

	it("対象ユーザー ID が空ならエラーにする", () => {
		expect(() => {
			return buildReminderMessage("   ");
		}).toThrow("リマインダーの対象ユーザー ID が空です。");
	});
});
