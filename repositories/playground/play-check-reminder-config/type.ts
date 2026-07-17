// In scope: play-check reminder repository が公開する入出力型
// Out of scope: validation schema、DB行型、永続化操作

/** Guild・対象利用者ごとの play-check reminder 配信設定。 */
export interface PlayCheckReminderConfig {
	guildId: string;
	channelId: string;
	userId: string;
}

/** play-check reminder 配信設定の保存入力。 */
export interface SavePlayCheckReminderConfigInput {
	guildId: string;
	channelId: string;
	userId: string;
}
