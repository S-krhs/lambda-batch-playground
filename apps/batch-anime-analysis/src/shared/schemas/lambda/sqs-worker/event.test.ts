import { describe, expect, it } from "vitest";
import { sqsWorkerEventSchema } from "./event.js";

describe("sqsWorkerEventSchema", () => {
	it("起動イベントを検証し、使う項目だけに正規化する", () => {
		const parsed = sqsWorkerEventSchema.parse({
			Records: [
				{
					messageId: "message-1",
					body: '{"dataSourceId":"source-a"}',
					// AWS が付与する未使用フィールドは落とす。
					receiptHandle: "receipt-1",
					eventSource: "aws:sqs",
				},
			],
		});

		expect(parsed).toEqual({
			Records: [
				{
					messageId: "message-1",
					body: '{"dataSourceId":"source-a"}',
				},
			],
		});
	});

	it("Records が欠けたイベントはエラーにする", () => {
		expect(() => {
			return sqsWorkerEventSchema.parse({});
		}).toThrow("Records");
	});

	it("messageId が空、または body が string でない record はエラーにする", () => {
		expect(() => {
			return sqsWorkerEventSchema.parse({
				Records: [{ messageId: "", body: "{}" }],
			});
		}).toThrow("messageId");

		expect(() => {
			return sqsWorkerEventSchema.parse({
				Records: [
					{ messageId: "message-1", body: { dataSourceId: "source-a" } },
				],
			});
		}).toThrow("body");
	});
});
