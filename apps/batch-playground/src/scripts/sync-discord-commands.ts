// In scope: 環境変数から認証情報を読み、宣言済みのスラッシュコマンド定義を Discord guild へ bulk overwrite で同期する
// Out of scope: コマンドの応答内容、interaction の解釈、コマンド定義の宣言
// 実行前提: 各 workspace を build 済みであること(node が dist を読むため)。root の `npm run discord:sync` から起動する。
import { DiscordCommandClient } from "@eskra-aws-playground/integration-discord/discord-command-client.js";

import { DISCORD_COMMAND_DEFINITIONS } from "../handlers/function-url/routes/discord-interaction/command-definitions.js";

const requireEnv = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`環境変数 ${name} が設定されていません。`);
	}

	return value;
};

const syncDiscordCommands = async (): Promise<void> => {
	const botToken = requireEnv("DISCORD_BOT_TOKEN");
	const applicationId = requireEnv("DISCORD_APPLICATION_ID");
	const guildId = requireEnv("DISCORD_GUILD_ID");

	const client = new DiscordCommandClient(botToken);
	await client.overwriteGuildCommands(
		applicationId,
		guildId,
		DISCORD_COMMAND_DEFINITIONS,
	);

	const registered = DISCORD_COMMAND_DEFINITIONS.map((command) => {
		return `/${command.name}`;
	}).join(", ");
	console.log(`Discord guild コマンドを同期しました: ${registered}`);
};

syncDiscordCommands().catch((error: unknown) => {
	console.error(
		error instanceof Error ? error.message : "コマンド同期に失敗しました。",
	);
	process.exit(1);
});
