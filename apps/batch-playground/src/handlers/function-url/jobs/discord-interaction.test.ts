import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FunctionUrlEvent } from "../schema.js";
import { discordInteractionJob } from "./discord-interaction.js";

const verifier = vi.hoisted(() => {
	return { verifyInteractionSignature: vi.fn() };
});

vi.mock(
	"@eskra-aws-playground/integration-discord/interaction-signature-verifier.js",
	() => {
		return {
			verifyInteractionSignature: verifier.verifyInteractionSignature,
		};
	},
);

vi.mock("sst/resource", () => {
	return {
		Resource: { DiscordInteractionPublicKey: { value: "test-public-key" } },
	};
});

const timestamp = "1720000000";
const signature = "test-signature";
const targetUserId = "111111111111111111";
const otherUserId = "222222222222222222";

const buildEvent = (
	rawBody: string,
	options: { base64?: boolean } = {},
): FunctionUrlEvent => {
	return {
		rawPath: "/discord/interactions",
		headers: {
			"x-signature-ed25519": signature,
			"x-signature-timestamp": timestamp,
		},
		body: options.base64
			? Buffer.from(rawBody, "utf8").toString("base64")
			: rawBody,
		isBase64Encoded: options.base64 ?? false,
	};
};

const buildComponentInteractionBody = (
	customId: string,
	pressedUserId: string,
): string => {
	return JSON.stringify({
		type: 3,
		data: { custom_id: customId },
		member: { user: { id: pressedUserId } },
	});
};

beforeEach(() => {
	verifier.verifyInteractionSignature.mockReset();
	verifier.verifyInteractionSignature.mockReturnValue(true);
});

describe("discordInteractionJob", () => {
	it("署名検証に失敗したら 401 を返す", async () => {
		verifier.verifyInteractionSignature.mockReturnValue(false);

		const response = await discordInteractionJob(buildEvent('{"type":1}'));

		expect(response.statusCode).toBe(401);
	});

	it("PING には PONG を返す", async () => {
		const response = await discordInteractionJob(buildEvent('{"type":1}'));

		expect(response.statusCode).toBe(200);
		expect(JSON.parse(response.body)).toEqual({ type: 1 });
	});

	it("base64 エンコードされた body はデコードした raw body で署名を検証する", async () => {
		const response = await discordInteractionJob(
			buildEvent('{"type":1}', { base64: true }),
		);

		expect(response.statusCode).toBe(200);
		expect(verifier.verifyInteractionSignature).toHaveBeenCalledWith({
			publicKey: "test-public-key",
			signature,
			timestamp,
			rawBody: '{"type":1}',
		});
	});

	it("対象ユーザーのボタン押下は元メッセージを選択結果へ更新しボタンを取り除く", async () => {
		const rawBody = buildComponentInteractionBody(
			`play-check-reminder:${targetUserId}:won`,
			targetUserId,
		);

		const response = await discordInteractionJob(buildEvent(rawBody));

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.type).toBe(7);
		expect(responseBody.data.components).toEqual([]);
		expect(responseBody.data.content).toContain("はい（勝った）");
	});

	it("対象外ユーザーのボタン押下は本人にだけ見える専用メッセージを返す", async () => {
		const rawBody = buildComponentInteractionBody(
			`play-check-reminder:${targetUserId}:won`,
			otherUserId,
		);

		const response = await discordInteractionJob(buildEvent(rawBody));

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.type).toBe(4);
		expect(responseBody.data.flags).toBe(64);
		expect(responseBody.data.content).toContain(`<@${targetUserId}>`);
	});

	it("不明な custom_id は対応外の ephemeral メッセージを返す", async () => {
		const rawBody = buildComponentInteractionBody(
			"unknown-feature:xxx",
			targetUserId,
		);

		const response = await discordInteractionJob(buildEvent(rawBody));

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.type).toBe(4);
		expect(responseBody.data.flags).toBe(64);
	});

	it("autocomplete には空の候補一覧を返す", async () => {
		const response = await discordInteractionJob(buildEvent('{"type":4}'));

		expect(response.statusCode).toBe(200);
		expect(JSON.parse(response.body)).toEqual({
			type: 8,
			data: { choices: [] },
		});
	});

	it("interaction body の JSON が不正なら 400 を返す", async () => {
		const response = await discordInteractionJob(buildEvent("not-a-json"));

		expect(response.statusCode).toBe(400);
	});
});
