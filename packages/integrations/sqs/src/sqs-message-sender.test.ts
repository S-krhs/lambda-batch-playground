import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => {
	return vi.fn();
});

vi.mock("@aws-sdk/client-sqs", () => {
	return {
		SQSClient: class {
			send = send;
		},
		SendMessageBatchCommand: class {
			public constructor(public readonly input: unknown) {}
		},
	};
});

import { SqsMessageSender } from "./sqs-message-sender.js";

describe("SqsMessageSender", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("最大 10 件ごとに batch 分割して送信する", async () => {
		send.mockResolvedValue({});
		const sender = new SqsMessageSender("https://sqs.example.com/queue");
		const messages = Array.from({ length: 23 }, (_, index) => {
			return { id: `message-${index}`, body: { index } };
		});

		await sender.sendMessages(messages);

		expect(send).toHaveBeenCalledTimes(3);
	});

	it("送信結果に Failed があれば失敗 id を含めて throw する", async () => {
		send.mockResolvedValue({ Failed: [{ Id: "message-1" }] });
		const sender = new SqsMessageSender("https://sqs.example.com/queue");

		await expect(
			sender.sendMessages([{ id: "message-1", body: {} }]),
		).rejects.toThrow("message-1");
	});

	it("message が空なら SQS を呼ばない", async () => {
		const sender = new SqsMessageSender("https://sqs.example.com/queue");

		await sender.sendMessages([]);

		expect(send).not.toHaveBeenCalled();
	});
});
