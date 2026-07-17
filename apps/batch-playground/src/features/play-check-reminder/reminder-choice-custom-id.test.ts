import { describe, expect, it } from "vitest";

import {
	buildReminderChoiceCustomId,
	parseReminderChoiceCustomId,
} from "./reminder-choice-custom-id.js";

describe("reminder choice custom ID", () => {
	it("対象ユーザーと選択肢から custom_id を生成する", () => {
		expect(buildReminderChoiceCustomId("123", "won")).toBe(
			"play-check-reminder:123:won",
		);
	});

	it("custom_id をリマインダーの選択として解釈する", () => {
		expect(parseReminderChoiceCustomId("play-check-reminder:123:won")).toEqual({
			targetUserId: "123",
			choiceId: "won",
			choiceLabel: "はい（勝った）",
		});
	});

	it("形式・prefix・選択肢が不明な custom_id は解釈しない", () => {
		expect(parseReminderChoiceCustomId("play-check-reminder")).toBeUndefined();
		expect(parseReminderChoiceCustomId("unknown:123:won")).toBeUndefined();
		expect(
			parseReminderChoiceCustomId("play-check-reminder:123:unknown"),
		).toBeUndefined();
	});
});
