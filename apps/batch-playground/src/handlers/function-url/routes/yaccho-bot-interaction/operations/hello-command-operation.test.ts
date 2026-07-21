import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordInteractionCallback } from "@/external-protocols/discord-message/parse.js";
import { helloCommandOperation } from "./hello-command-operation.js";

const enqueue = vi.hoisted(() => {
	return { enqueueInteractionJob: vi.fn() };
});

vi.mock("@/handlers/function-url/interaction-job/enqueue.js", () => {
	return { enqueueInteractionJob: enqueue.enqueueInteractionJob };
});

const callback: DiscordInteractionCallback = {
	applicationId: "999",
	token: "tok",
};

beforeEach(() => {
	enqueue.enqueueInteractionJob.mockReset();
});

describe("helloCommandOperation", () => {
	it("あいさつジョブを enqueue し公開 deferred で ACK する", async () => {
		const result = await helloCommandOperation(callback);

		expect(enqueue.enqueueInteractionJob).toHaveBeenCalledWith({
			job: "yaccho-hello-reply",
			applicationId: "999",
			token: "tok",
		});
		expect(result).toEqual({ kind: "OK", data: { type: 5 } });
	});
});
