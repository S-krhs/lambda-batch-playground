import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./handler.js";

const job = vi.hoisted(() => {
	return { discordInteractionJob: vi.fn() };
});

vi.mock("./jobs/discord-interaction.js", () => {
	return { discordInteractionJob: job.discordInteractionJob };
});

const buildEvent = (rawPath: string) => {
	return {
		rawPath,
		headers: { "x-signature-ed25519": "abc" },
		body: '{"type":1}',
		isBase64Encoded: false,
	};
};

beforeEach(() => {
	job.discordInteractionJob.mockReset();
});

describe("handler", () => {
	it("job の成功結果を 200 の JSON レスポンスへ組み立てる", async () => {
		job.discordInteractionJob.mockResolvedValue({
			ok: true,
			body: { type: 1 },
		});
		const event = buildEvent("/discord/interactions");

		const response = await handler(event);

		expect(job.discordInteractionJob).toHaveBeenCalledWith(event);
		expect(response).toEqual({
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: '{"type":1}',
		});
	});

	it("job の失敗理由を HTTP status へ対応づける", async () => {
		job.discordInteractionJob.mockResolvedValue({
			ok: false,
			error: "unauthorized",
		});

		const response = await handler(buildEvent("/discord/interactions"));

		expect(response.statusCode).toBe(401);
	});

	it("envelope 形式が不正なら 400 を返し job を呼ばない", async () => {
		const response = await handler({ headers: {} });

		expect(response.statusCode).toBe(400);
		expect(job.discordInteractionJob).not.toHaveBeenCalled();
	});

	it("対応しないパスは 404 を返し job を呼ばない", async () => {
		const response = await handler({ rawPath: "/unknown", headers: {} });

		expect(response.statusCode).toBe(404);
		expect(job.discordInteractionJob).not.toHaveBeenCalled();
	});
});
