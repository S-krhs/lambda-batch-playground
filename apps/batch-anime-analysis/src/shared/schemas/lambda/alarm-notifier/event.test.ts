import { describe, expect, it } from "vitest";
import { alarmNotifierEventSchema } from "./event.js";

describe("alarmNotifierEventSchema", () => {
	it("起動イベントを検証し、使う項目だけに正規化する", () => {
		const parsed = alarmNotifierEventSchema.parse({
			Records: [
				{
					Sns: {
						Message: "ALARM: batch failed",
						Subject: "ALARM",
						Timestamp: "2026-07-05T00:00:00.000Z",
						// AWS が付与する未使用フィールドは落とす。
						SignatureVersion: "1",
					},
					EventSource: "aws:sns",
				},
			],
		});

		expect(parsed).toEqual({
			Records: [
				{
					Sns: {
						Message: "ALARM: batch failed",
						Subject: "ALARM",
						Timestamp: "2026-07-05T00:00:00.000Z",
					},
				},
			],
		});
	});

	it("Records が欠けたイベントはエラーにする", () => {
		expect(() => {
			return alarmNotifierEventSchema.parse({});
		}).toThrow("Records");
	});

	it("Sns.Message が欠けた record はエラーにする", () => {
		expect(() => {
			return alarmNotifierEventSchema.parse({
				Records: [{ Sns: { Subject: "ALARM" } }],
			});
		}).toThrow("Message");
	});
});
