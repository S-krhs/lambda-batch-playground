# Playground Repositories

playground 関連 app で共有する静的データと repository を置きます。

## data

`data.ts` は、UMA ワンドロのお題候補の静的カタログです。
どのお題がどのレアリティで出るかだけを表し、抽選の重みやメッセージ文面は含めません。

```json
{
  "rarity": "RARE",
  "name": "ダイワスカーレット"
}
```

- `rarity` は `types.ts` の `TOPIC_RARITIES` に含まれる値だけを使います。
- レアリティごとの抽選重みやメッセージテンプレートは、お題候補ではなく feature 側の設定として扱います。

## Discord 設定

設定のスコープごとにテーブルを分け、`user_id` の null や Guild 全体を表す予約値を使いません。

- `playground.discord_guild_settings`: Guild 全体へ適用する設定
- `playground.discord_user_settings`: Guild 内の利用者ごとに適用する設定

どちらも `application_key` と `setting_key` で用途を識別し、用途固有の JSONB を `configuration` に保存します。command 追加だけで migration を増やさず、用途ごとの repository が JSON schema を管理します。

### Play check reminder

`playCheckReminderConfigRepository` は `playground.discord_user_settings` のうち、`application_key = yaccho-bot` かつ `setting_key = play-check-reminder` の JSONB だけを扱います。

- 対象利用者 ID を `user_id`、JSON を `{ version: 1, channelId }` として保存し、Guild 内の利用者ごとに独立した行を持ちます。
- 保存前と読み出し時に repository 内の strict Zod schema で検証します。
- JSON schema が不正な行は無視せず読み出しを失敗させます。
