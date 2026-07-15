import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./handler.js";

const job = vi.hoisted(() => {
	return { discordInteractionJob: vi.fn() };
});

vi.mock("./jobs/discord-interaction.js", () => {
	return { discordInteractionJob: job.discordInteractionJob };
});

beforeEach(() => {
	job.discordInteractionJob.mockReset();
});

describe("handler", () => {
	it("パスに対応する job へ envelope を渡し、その応答を返す", async () => {
		const response = { statusCode: 200, headers: {}, body: "{}" };
		job.discordInteractionJob.mockResolvedValue(response);
		const event = {
			rawPath: "/discord/interactions",
			headers: { "x-signature-ed25519": "abc" },
			body: '{"type":1}',
			isBase64Encoded: false,
		};

		await expect(handler(event)).resolves.toBe(response);
		expect(job.discordInteractionJob).toHaveBeenCalledWith(event);
	});

	it("envelope 形式が不正なら 400 を返し job を呼ばない", async () => {
		const response = await handler({ headers: {} });

		expect(response.statusCode).toBe(400);
		expect(job.discordInteractionJob).not.toHaveBeenCalled();
	});

	it("対応しないパスは 404 を返し job を呼ばない", async () => {
		const response = await handler({
			rawPath: "/unknown",
			headers: {},
		});

		expect(response.statusCode).toBe(404);
		expect(job.discordInteractionJob).not.toHaveBeenCalled();
	});
});
