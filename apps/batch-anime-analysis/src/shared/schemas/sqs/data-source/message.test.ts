import { describe, expect, it } from "vitest";
import { dataSourceMessageSchema } from "./message.js";

describe("dataSourceMessageSchema", () => {
	it("worker message を検証して正規化する", () => {
		expect(dataSourceMessageSchema.parse({ dataSourceId: "source-a" })).toEqual(
			{
				dataSourceId: "source-a",
			},
		);
	});

	it("dataSourceId が欠けた message はエラーにする", () => {
		expect(() => {
			return dataSourceMessageSchema.parse({});
		}).toThrow("dataSourceId");
	});

	it("dataSourceId が空または string でない message はエラーにする", () => {
		expect(() => {
			return dataSourceMessageSchema.parse({ dataSourceId: "" });
		}).toThrow("dataSourceId");

		expect(() => {
			return dataSourceMessageSchema.parse({ dataSourceId: 1 });
		}).toThrow("dataSourceId");
	});
});
