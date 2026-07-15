import { describe, expect, it } from "vitest";

import { parseInteraction } from "../../../../../external-protocols/discord/discord-message.js";
import { messageComponentOperation } from "./message-component-operation.js";

const operation = (customId: string, pressedUserId: string) => {
	const interaction = parseInteraction(
		JSON.stringify({
			type: 3,
			data: { custom_id: customId },
			user: { id: pressedUserId },
		}),
	);
	if (!interaction) {
		throw new Error("test interaction の parse に失敗しました");
	}

	return messageComponentOperation(interaction);
};

describe("messageComponentOperation", () => {
	it("対象ユーザーの選択に対応する更新メッセージを返す", () => {
		expect(operation("play-check-reminder:123:won", "123")).toEqual({
			kind: "update-message",
			content:
				"<@123> 今日は遊技をしましたか？\n**はい（勝った）** を選択しました",
		});
	});

	it("対象外ユーザーには専用のephemeralメッセージを返す", () => {
		expect(operation("play-check-reminder:123:won", "999")).toEqual({
			kind: "ephemeral",
			content: "このリマインダーは <@123> さん専用です。",
		});
	});

	it("解釈できないcomponentには未対応メッセージを返す", () => {
		expect(operation("unknown:payload", "123")).toEqual({
			kind: "ephemeral",
			content: "この操作には対応していません。",
		});
	});
});
