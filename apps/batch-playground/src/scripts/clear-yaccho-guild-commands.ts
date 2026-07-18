// In scope: global command 移行後に残る Yaccho Bot の旧 guild command を明示した Guild から削除する
// Out of scope: global command 同期、Guild ID の保存、Bot の install 管理
import { DiscordCommandClient } from "@eskra-aws-playground/integration-discord/discord-command-client.js";
import { Resource } from "sst/resource";

const guildId = process.argv[2];
if (!guildId) {
	throw new Error("削除対象の Discord guild ID を引数で指定してください。");
}

const client = new DiscordCommandClient(Resource.YacchoDiscordBotToken.value);

client
	.overwriteGuildCommands(
		Resource.YacchoDiscordApplicationId.value,
		guildId,
		[],
	)
	.then(() => {
		console.log("Yaccho Bot の旧 guild command を削除しました。");
	})
	.catch((error: unknown) => {
		console.error(
			error instanceof Error
				? error.message
				: "旧 guild command の削除に失敗しました。",
		);
		process.exit(1);
	});
