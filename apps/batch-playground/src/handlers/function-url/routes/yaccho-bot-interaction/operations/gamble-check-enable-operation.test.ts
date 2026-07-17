import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import { gambleCheckEnableOperation } from "./gamble-check-enable-operation.js";

const reminderConfigStore = vi.hoisted(() => {
	return { save: vi.fn(), deleteByGuildIdAndUserId: vi.fn() };
});

vi.mock("@/features/play-check-reminder/reminder-config-store.js", () => {
	return { reminderConfigStore };
});

const guildCommand = (userId = "333"): DiscordApplicationCommandInteraction => {
	return {
		kind: "application-command",
		userId,
		command: { name: "gamble-check-enable", options: [] },
		context: { kind: "guild", guildId: "111", channelId: "222" },
	};
};

beforeEach(() => {
	reminderConfigStore.save.mockReset();
});

describe("gambleCheckEnableOperation", () => {
	it("現在の Guild・channel と実行者本人で有効化する", async () => {
		const result = await gambleCheckEnableOperation(guildCommand());

		expect(reminderConfigStore.save).toHaveBeenCalledWith({
			guildId: "111",
			channelId: "222",
			userId: "333",
		});
		expect(result).toEqual({
			kind: "OK",
			data: {
				type: 4,
				data: {
					content: "このチャンネルで自分のリマインダーを有効にしました。",
					flags: 64,
					allowed_mentions: { parse: [] },
				},
			},
		});
	});

	it("サーバー外からの実行は設定を変更しない", async () => {
		const result = await gambleCheckEnableOperation({
			kind: "application-command",
			userId: "333",
			command: { name: "gamble-check-enable", options: [] },
			context: { kind: "direct-message" },
		});

		expect(reminderConfigStore.save).not.toHaveBeenCalled();
		expect(result.data.data.content).toContain("サーバー内");
	});
});
