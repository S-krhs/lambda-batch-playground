// In scope: Discord へ登録するスラッシュコマンドの名前と登録定義を single source of truth として宣言する
// Out of scope: コマンドの応答内容の解決、interaction の parse、Discord API 呼び出し
import type { DiscordCommandDefinition } from "@eskra-aws-playground/integration-discord/discord-command-client.js";

/** /hello コマンドのコマンド名。route の分岐と Discord への登録で共有する。 */
export const HELLO_COMMAND_NAME = "hello";

/** Discord へ bulk overwrite で登録するスラッシュコマンド定義の一覧。コマンドを追加したらここへ足す。 */
export const DISCORD_COMMAND_DEFINITIONS: readonly DiscordCommandDefinition[] =
	[{ name: HELLO_COMMAND_NAME, description: "やおよろ～と挨拶を返す" }];
