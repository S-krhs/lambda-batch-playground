import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import { gambleCheckDisableOperation } from "./gamble-check-disable-operation.js";

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
		command: { name: "gamble-check-disable", options: [] },
		context: { kind: "guild", guildId: "111", channelId: "222" },
	};
};

beforeEach(() => {
	reminderConfigStore.deleteByGuildIdAndUserId.mockReset();
});

describe("gambleCheckDisableOperation", () => {
	it("実行者本人の設定だけを削除する", async () => {
		reminderConfigStore.deleteByGuildIdAndUserId.mockResolvedValue(true);

		const result = await gambleCheckDisableOperation(guildCommand());

		expect(reminderConfigStore.deleteByGuildIdAndUserId).toHaveBeenCalledWith(
			"111",
			"333",
		);
		expect(result.data.data.content).toBe(
			"自分のリマインダーを無効にしました。",
		);
	});

	it("設定が無ければその旨を返す", async () => {
		reminderConfigStore.deleteByGuildIdAndUserId.mockResolvedValue(false);

		const result = await gambleCheckDisableOperation(guildCommand());

		expect(result.data.data.content).toBe(
			"自分のリマインダーは設定されていません。",
		);
	});

	it("サーバー外からの実行は設定を変更しない", async () => {
		const result = await gambleCheckDisableOperation({
			kind: "application-command",
			userId: "333",
			command: { name: "gamble-check-disable", options: [] },
			context: { kind: "direct-message" },
		});

		expect(reminderConfigStore.deleteByGuildIdAndUserId).not.toHaveBeenCalled();
		expect(result.data.data.content).toContain("サーバー内");
	});
});
