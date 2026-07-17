import { afterEach, describe, expect, it, vi } from "vitest";

import {
	DiscordCommandClient,
	type DiscordCommandDefinition,
	DiscordCommandError,
	type DiscordCommandResponseDetails,
} from "./discord-command-client.js";

const BOT_TOKEN = "super-secret-bot-token";
const APPLICATION_ID = "111111111111111111";
const GUILD_ID = "222222222222222222";

const commands: readonly DiscordCommandDefinition[] = [
	{ name: "hello", description: "挨拶を返す" },
];

describe("DiscordCommandClient", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("空の bot token を拒否する", () => {
		expect(() => {
			return new DiscordCommandClient("");
		}).toThrow(DiscordCommandError);

		expect(() => {
			return new DiscordCommandClient("   ");
		}).toThrow(DiscordCommandError);
	});

	it("数字のみでない application ID・guild ID を拒否する", async () => {
		const client = new DiscordCommandClient(BOT_TOKEN);

		await expect(
			client.overwriteGuildCommands("not-a-snowflake", GUILD_ID, commands),
		).rejects.toThrow(DiscordCommandError);
		await expect(
			client.overwriteGuildCommands(APPLICATION_ID, "", commands),
		).rejects.toThrow(DiscordCommandError);
		await expect(
			client.getGuildCommands("not-a-snowflake", GUILD_ID),
		).rejects.toThrow(DiscordCommandError);
	});

	it("guild コマンド API へ正しい URL・メソッド・ヘッダー・payload で PUT する", async () => {
		const fetchMock = vi.fn(async () => {
			return new Response(null, { status: 200 });
		});
		vi.stubGlobal("fetch", fetchMock);

		const client = new DiscordCommandClient(BOT_TOKEN);
		await client.overwriteGuildCommands(APPLICATION_ID, GUILD_ID, commands);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as unknown as [
			string,
			RequestInit,
		];

		expect(url).toBe(
			`https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
		);
		expect(init.method).toBe("PUT");
		expect(init.headers).toEqual({
			Authorization: `Bot ${BOT_TOKEN}`,
			"Content-Type": "application/json",
		});
		expect(JSON.parse(init.body as string)).toEqual(commands);
	});

	it("guild コマンド API へ正しい URL・メソッド・ヘッダーで GET し、登録済みコマンドを返す", async () => {
		const registered = [
			{ id: "999", name: "hello", description: "やおよろ～と挨拶を返す" },
		];
		const fetchMock = vi.fn(async () => {
			return new Response(JSON.stringify(registered), { status: 200 });
		});
		vi.stubGlobal("fetch", fetchMock);

		const client = new DiscordCommandClient(BOT_TOKEN);
		const result = await client.getGuildCommands(APPLICATION_ID, GUILD_ID);

		expect(result).toEqual(registered);
		const [url, init] = fetchMock.mock.calls[0] as unknown as [
			string,
			RequestInit,
		];

		expect(url).toBe(
			`https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
		);
		expect(init.method).toBe("GET");
		expect(init.headers).toEqual({ Authorization: `Bot ${BOT_TOKEN}` });
	});

	it("失敗応答の本文をエラーメッセージに含めず details で安全化する", async () => {
		const responseBody = `token=${BOT_TOKEN} ${"x".repeat(700)}`;

		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(responseBody, { status: 403 });
			}),
		);

		const client = new DiscordCommandClient(BOT_TOKEN);
		const error = await client
			.overwriteGuildCommands(APPLICATION_ID, GUILD_ID, commands)
			.catch((error: unknown) => {
				return error;
			});

		expect(error).toBeInstanceOf(DiscordCommandError);
		const errorMessage = (error as DiscordCommandError).message;
		expect(errorMessage).toBe("Discord Command API 応答が失敗しました: 403");
		expect(errorMessage).not.toContain(BOT_TOKEN);

		const details = (error as DiscordCommandError)
			.responseDetails as DiscordCommandResponseDetails;

		expect(details.status).toBe(403);
		expect(details.body).toContain("[redacted-discord-bot-token]");
		expect(details.body).not.toContain(BOT_TOKEN);
	});

	it("fetch 例外のメッセージに bot token が混入しない", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error(`接続に失敗しました: Bot ${BOT_TOKEN}`);
			}),
		);

		const client = new DiscordCommandClient(BOT_TOKEN);
		const error = await client
			.overwriteGuildCommands(APPLICATION_ID, GUILD_ID, commands)
			.catch((error: unknown) => {
				return error;
			});

		expect(error).toBeInstanceOf(DiscordCommandError);
		expect((error as DiscordCommandError).message).not.toContain(BOT_TOKEN);
		expect((error as DiscordCommandError).message).toContain(
			"[redacted-discord-bot-token]",
		);
	});
});
