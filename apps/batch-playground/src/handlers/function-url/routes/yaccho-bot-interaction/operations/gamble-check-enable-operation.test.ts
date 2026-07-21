import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
	DiscordApplicationCommandInteraction,
	DiscordInteractionCallback,
} from "@/external-protocols/discord-message/parse.js";
import { gambleCheckEnableOperation } from "./gamble-check-enable-operation.js";

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

const guildCommand = (userId = "333"): DiscordApplicationCommandInteraction => {
	return {
		kind: "application-command",
		userId,
		command: { name: "gamble-check-enable", options: [] },
		context: { kind: "guild", guildId: "111", channelId: "222" },
	};
};

beforeEach(() => {
	enqueue.enqueueInteractionJob.mockReset();
});

describe("gambleCheckEnableOperation", () => {
	it("現在の Guild・channel と実行者本人で登録ジョブを enqueue し ephemeral deferred で ACK する", async () => {
		const result = await gambleCheckEnableOperation(guildCommand(), callback);

		expect(enqueue.enqueueInteractionJob).toHaveBeenCalledWith({
			job: "gamble-check-enable",
			applicationId: "999",
			token: "tok",
			guildId: "111",
			channelId: "222",
			userId: "333",
		});
		expect(result).toEqual({
			kind: "OK",
			data: { type: 5, data: { flags: 64 } },
		});
	});

	it("サーバー外からの実行は enqueue せず即時 ephemeral を返す", async () => {
		const result = await gambleCheckEnableOperation(
			{
				kind: "application-command",
				userId: "333",
				command: { name: "gamble-check-enable", options: [] },
				context: { kind: "direct-message" },
			},
			callback,
		);

		expect(enqueue.enqueueInteractionJob).not.toHaveBeenCalled();
		expect(result).toEqual({
			kind: "OK",
			data: {
				type: 4,
				data: {
					content: "サーバー内のチャンネルで使ってね～",
					flags: 64,
					allowed_mentions: { parse: [] },
				},
			},
		});
	});
});
