import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscordApplicationCommandInteraction } from "@/external-protocols/discord-message/parse.js";
import { gambleCheckDisableOperation } from "./gamble-check-disable-operation.js";

const channelSettingRepository = vi.hoisted(() => {
	return { deleteByGuildIdAndUserId: vi.fn() };
});

vi.mock(
	"@eskra-aws-playground/repositories/playground/channel-setting/repository.js",
	() => {
		return { channelSettingRepository };
	},
);

const guildCommand = (userId = "333"): DiscordApplicationCommandInteraction => {
	return {
		kind: "application-command",
		userId,
		command: { name: "gamble-check-disable", options: [] },
		context: { kind: "guild", guildId: "111", channelId: "222" },
	};
};

beforeEach(() => {
	channelSettingRepository.deleteByGuildIdAndUserId.mockReset();
});

describe("gambleCheckDisableOperation", () => {
	it("実行者本人の設定だけを削除する", async () => {
		channelSettingRepository.deleteByGuildIdAndUserId.mockResolvedValue({
			guildId: "111",
			channelId: "222",
			userId: "333",
		});

		const result = await gambleCheckDisableOperation(guildCommand());

		expect(
			channelSettingRepository.deleteByGuildIdAndUserId,
		).toHaveBeenCalledWith({
			applicationKey: "yaccho-bot",
			settingKey: "play-check-reminder",
			guildId: "111",
			userId: "333",
		});
		expect(result.data.data.content).toBe("りょ～！またね～");
	});

	it("設定が無ければその旨を返す", async () => {
		channelSettingRepository.deleteByGuildIdAndUserId.mockResolvedValue(null);

		const result = await gambleCheckDisableOperation(guildCommand());

		expect(result.data.data.content).toBe(
			"よよよ……リマインダーはまだ設定されていないのです～",
		);
	});

	it("サーバー外からの実行は設定を変更しない", async () => {
		const result = await gambleCheckDisableOperation({
			kind: "application-command",
			userId: "333",
			command: { name: "gamble-check-disable", options: [] },
			context: { kind: "direct-message" },
		});

		expect(
			channelSettingRepository.deleteByGuildIdAndUserId,
		).not.toHaveBeenCalled();
		expect(result.data.data.content).toBe("サーバー内のチャンネルで使ってね～");
	});
});
