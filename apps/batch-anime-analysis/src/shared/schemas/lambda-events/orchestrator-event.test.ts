import { describe, expect, it } from "vitest";
import { orchestratorEventSchema } from "./orchestrator-event.js";

describe("orchestratorEventSchema", () => {
	it("起動イベントを検証して正規化する", () => {
		expect(orchestratorEventSchema.parse({ scheduleHour: 9 })).toEqual({
			scheduleHour: 9,
		});
	});

	it("scheduleHour が欠けたイベントはエラーにする", () => {
		expect(() => {
			return orchestratorEventSchema.parse({});
		}).toThrow("scheduleHour");
	});

	it("scheduleHour が number でないイベントはエラーにする", () => {
		expect(() => {
			return orchestratorEventSchema.parse({ scheduleHour: "9" });
		}).toThrow("scheduleHour");
	});

	it("scheduleHour が 0 から 23 の整数でないイベントはエラーにする", () => {
		expect(() => {
			return orchestratorEventSchema.parse({ scheduleHour: 24 });
		}).toThrow("scheduleHour");

		expect(() => {
			return orchestratorEventSchema.parse({ scheduleHour: 9.5 });
		}).toThrow("scheduleHour");
	});
});
