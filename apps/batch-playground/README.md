# Batch Playground

Lambda イベントの `job` に応じてバッチジョブを実行する app です。

## 実行できるジョブ

### `uma-one-draw-topic`

UMA ワンドロのお題を生成し、Discord Webhook へ通知します。

```json
{
  "job": "uma-one-draw-topic"
}
```

- `job` は必須です。
- Discord Webhook URL はイベントに含めず、SST linked secret またはローカル環境変数から解決します。

### `uma-one-draw-topic-scheduler`

当日 JST 12:00-18:00 のランダムな時刻に `uma-one-draw-topic` を起動する one-time schedule を EventBridge Scheduler へ登録します。schedule は実行後に自動削除されます。

```json
{
  "job": "uma-one-draw-topic-scheduler"
}
```

- schedule group 名と role ARN は SST が設定する環境変数から解決します。
- 起動対象 Lambda の ARN は Lambda context から解決します。ローカル実行では `UMA_ONE_DRAW_TOPIC_TARGET_FUNCTION_ARN` で代替します。
- 当日分が登録済みの場合は二重登録せず正常終了します。ただし発火後は schedule が自動削除されるため、その後に再実行すると再登録され通知が重複します。

## 環境変数

デプロイ時に GitHub Actions secret から SST secret として渡します。

- GitHub Actions secret: `UMA_ONE_DRAW_TOPIC_DISCORD_WEBHOOK_URL`
- SST secret env: `SST_SECRET_UmaOneDrawTopicDiscordWebhook`

デプロイ時に SST(`infra/sst.config.ts`)が Lambda へ設定します。

- `UMA_ONE_DRAW_TOPIC_SCHEDULE_GROUP_NAME`
- `UMA_ONE_DRAW_TOPIC_SCHEDULER_ROLE_ARN`

ローカル実行用 Discord Webhook:

- `UMA_ONE_DRAW_TOPIC_DISCORD_WEBHOOK_URL`
- `DEFAULT_DISCORD_WEBHOOK_URL`

ローカル実行:

- `BATCH_JOB`
- `UMA_ONE_DRAW_TOPIC_TARGET_FUNCTION_ARN`（`uma-one-draw-topic-scheduler` のみ）

例:

```bash
DEFAULT_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/fallback/yyy
BATCH_JOB=uma-one-draw-topic
```

## ローカル実行

1. `apps/batch-playground/.env.example` を `apps/batch-playground/.env` にコピーします。
2. `npm install`
3. `npm run local:batch-playground`

## ドキュメント

- アーキテクチャ: [docs/architecture.md](docs/architecture.md)
- 実装ルール: [docs/implementation-rules.md](docs/implementation-rules.md)
