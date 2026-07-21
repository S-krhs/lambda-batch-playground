import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordInteractionCallback } from "@/external-protocols/discord-message/parse.js";
import { inuihiroshiCommandOperation } from "./inuihiroshi-command-operation.js";

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

describe("inuihiroshiCommandOperation", () => {
	it("宣言ジョブを enqueue し公開 deferred で ACK する", async () => {
		const result = await inuihiroshiCommandOperation(callback);

		expect(enqueue.enqueueInteractionJob).toHaveBeenCalledWith({
			job: "kaguya-inuihiroshi-reply",
			applicationId: "999",
			token: "tok",
		});
		expect(result).toEqual({ kind: "OK", data: { type: 5 } });
	});
});
