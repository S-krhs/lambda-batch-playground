// In scope: 宣言済みのスラッシュコマンド定義を Discord guild へ bulk overwrite で同期する
// Out of scope: コマンドの応答内容、interaction の解釈、コマンド定義の宣言
// 実行前提: SST secret を Resource で参照するため `sst shell` 経由で起動する(root の `npm run discord:sync`)。
//           --dry-run は送信内容を表示するだけで secret も送信も不要(root の `npm run discord:sync:dry`)。
import { DiscordCommandClient } from "@eskra-aws-playground/integration-discord/discord-command-client.js";
import { Resource } from "sst/resource";

import { DISCORD_COMMAND_DEFINITIONS } from "../handlers/function-url/routes/discord-interaction/command-definitions.js";

const syncDiscordCommands = async (): Promise<void> => {
	if (process.argv.includes("--dry-run")) {
		console.log(
			"dry-run: 以下の内容で guild コマンドを bulk overwrite します(送信はしません)。",
		);
		console.log(JSON.stringify(DISCORD_COMMAND_DEFINITIONS, null, 2));
		return;
	}

	const client = new DiscordCommandClient(Resource.DiscordBotToken.value);
	await client.overwriteGuildCommands(
		Resource.DiscordApplicationId.value,
		Resource.DiscordGuildId.value,
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
