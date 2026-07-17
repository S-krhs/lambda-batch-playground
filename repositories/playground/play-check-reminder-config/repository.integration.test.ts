// TODO: 別タスクで testcontainers の PostgreSQL に移行する。
//       それまでは TEST_DATABASE_URL(ローカル用 Neon branch)が設定されている場合のみ実行される。
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { ZodError } from "zod";

import { getPrismaClient } from "../../db/client.js";
import { playCheckReminderConfigRepository } from "./repository.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testId = Date.now().toString();
const guildIds = [`${testId}01`, `${testId}02`, `${testId}03`];
const [guildId, anotherGuildId, invalidGuildId] = guildIds as [
	string,
	string,
	string,
];
const userId = `${testId}21`;
const anotherUserId = `${testId}22`;
const input = {
	guildId,
	channelId: `${testId}11`,
	userId,
};

const deleteTestRows = async (): Promise<void> => {
	const prisma = getPrismaClient();
	await prisma.discordUserSetting.deleteMany({
		where: {
			applicationKey: "yaccho-bot",
			guildId: { in: guildIds },
			settingKey: "play-check-reminder",
		},
	});
};

describe.skipIf(!testDatabaseUrl)(
	"playCheckReminderConfigRepository (integration)",
	() => {
		beforeAll(() => {
			process.env.DATABASE_URL = testDatabaseUrl;
		});

		beforeEach(deleteTestRows);
		afterEach(deleteTestRows);

		afterAll(async () => {
			await deleteTestRows();
			await getPrismaClient().$disconnect();
		});

		it("Guild・対象利用者ごとの JSON 設定を保存して読み戻せる", async () => {
			await playCheckReminderConfigRepository.save(input);

			const configs = await playCheckReminderConfigRepository.findMany();
			expect(configs).toContainEqual(input);

			const row = await getPrismaClient().discordUserSetting.findUnique({
				where: {
					applicationKey_guildId_userId_settingKey: {
						applicationKey: "yaccho-bot",
						guildId,
						userId,
						settingKey: "play-check-reminder",
					},
				},
			});
			expect(row?.configuration).toEqual({
				version: 1,
				channelId: input.channelId,
			});
		});

		it("同じ Guild・対象利用者の設定を 1 行のまま上書きする", async () => {
			await playCheckReminderConfigRepository.save(input);
			await playCheckReminderConfigRepository.save({
				...input,
				channelId: `${testId}12`,
			});

			const rows = await getPrismaClient().discordUserSetting.findMany({
				where: {
					applicationKey: "yaccho-bot",
					guildId,
					userId,
					settingKey: "play-check-reminder",
				},
			});
			expect(rows).toHaveLength(1);
			expect(rows[0]?.configuration).toEqual({
				version: 1,
				channelId: `${testId}12`,
			});
		});

		it("同じ Guild の別利用者を独立して保存・削除する", async () => {
			await playCheckReminderConfigRepository.save(input);
			const anotherInput = {
				...input,
				channelId: `${testId}12`,
				userId: anotherUserId,
			};
			await playCheckReminderConfigRepository.save(anotherInput);

			await expect(
				playCheckReminderConfigRepository.deleteByGuildIdAndUserId(
					guildId,
					userId,
				),
			).resolves.toBe(true);

			const configs = await playCheckReminderConfigRepository.findMany();
			expect(configs).not.toContainEqual(input);
			expect(configs).toContainEqual(anotherInput);
		});

		it("Guild・対象利用者の設定を削除し、削除対象の有無を返す", async () => {
			await playCheckReminderConfigRepository.save(input);

			await expect(
				playCheckReminderConfigRepository.deleteByGuildIdAndUserId(
					guildId,
					userId,
				),
			).resolves.toBe(true);
			await expect(
				playCheckReminderConfigRepository.deleteByGuildIdAndUserId(
					guildId,
					userId,
				),
			).resolves.toBe(false);
		});

		it("保存済み JSON が schema に違反していれば読み込みを失敗させる", async () => {
			await getPrismaClient().discordUserSetting.create({
				data: {
					applicationKey: "yaccho-bot",
					guildId: invalidGuildId,
					userId: `${testId}23`,
					settingKey: "play-check-reminder",
					configuration: {
						version: 1,
						channelId: `${testId}13`,
						extra: true,
					},
				},
			});

			await expect(
				playCheckReminderConfigRepository.findMany(),
			).rejects.toBeInstanceOf(ZodError);
		});

		it("不正な入力は DB へ保存する前に失敗させる", async () => {
			await expect(
				playCheckReminderConfigRepository.save({
					...input,
					guildId: "not-a-snowflake",
				}),
			).rejects.toBeInstanceOf(ZodError);

			const count = await getPrismaClient().discordUserSetting.count({
				where: {
					applicationKey: "yaccho-bot",
					guildId: { in: [guildId, anotherGuildId] },
					settingKey: "play-check-reminder",
				},
			});
			expect(count).toBe(0);
		});
	},
);
