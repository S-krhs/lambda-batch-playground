import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordInteractionCallback } from "@/external-protocols/discord-message/parse.js";
import { helloCommandOperation } from "./hello-command-operation.js";

const sqs = vi.hoisted(() => {
	return { sendMessages: vi.fn() };
});

vi.mock("@eskra-aws-playground/integration-sqs/sqs-message-sender.js", () => {
	return {
		SqsMessageSender: class {
			sendMessages = sqs.sendMessages;
		},
	};
});

vi.mock("sst/resource", () => {
	return {
		Resource: {
			PlaygroundInteractionQueue: { url: "https://sqs.test/interaction-queue" },
		},
	};
});

const callback: DiscordInteractionCallback = {
	applicationId: "999",
	token: "tok",
};

beforeEach(() => {
	sqs.sendMessages.mockReset();
});

describe("helloCommandOperation", () => {
	it("あいさつジョブを enqueue し公開 deferred で ACK する", async () => {
		const result = await helloCommandOperation(callback);

		expect(sqs.sendMessages).toHaveBeenCalledWith([
			{
				id: "interaction-job",
				body: {
					job: "yaccho-hello-reply",
					applicationId: "999",
					token: "tok",
				},
			},
		]);
		expect(result).toEqual({ kind: "OK", data: { type: 5 } });
	});
});
