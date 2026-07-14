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
- Discord Webhook URL はイベントに含めず、SST linked secret から解決します。

### `uma-one-draw-topic-scheduler`

当日 JST 12:00-18:00 のランダムな時刻に `uma-one-draw-topic` を起動する one-time schedule を EventBridge Scheduler へ登録します。schedule は実行後に自動削除されます。

```json
{
  "job": "uma-one-draw-topic-scheduler"
}
```

- schedule group 名と role ARN は SST が設定する環境変数から解決します。
- 起動対象 Lambda の ARN は Lambda context から解決します。
- 当日分が登録済みの場合は二重登録せず正常終了します。ただし発火後は schedule が自動削除されるため、その後に再実行すると再登録され通知が重複します。
- cron は JST 00:00 起動のため、それ以降にデプロイや障害で当日分が未登録の日は、JST 18:00 より前に `{"job": "uma-one-draw-topic-scheduler"}` で Lambda を手動起動すると残り window 内で当日分を登録できます(18:00 以降はエラーになります)。

## 環境変数

デプロイ時に GitHub Actions secret から SST secret として渡します。

- GitHub Actions secret: `UMA_ONE_DRAW_TOPIC_DISCORD_WEBHOOK_URL`
- SST secret env: `SST_SECRET_UmaOneDrawTopicDiscordWebhook`

デプロイ時に SST(`infra/sst.config.ts`)が Lambda へ設定します。

- `UMA_ONE_DRAW_TOPIC_SCHEDULE_GROUP_NAME`
- `UMA_ONE_DRAW_TOPIC_SCHEDULER_ROLE_ARN`

## ローカル実行（sst dev）

ローカル実行は `sst dev` の Live Lambda に統合しています。`.env` は使いません。

1. `npm install`
2. 初回のみ、personal stage に secret を設定します。

   ```bash
   npx sst secret set UmaOneDrawTopicDiscordWebhook <webhook-url> --config infra/sst.config.ts --stage <your-stage>
   ```

3. リポジトリルートで `npm run dev` を実行します。
4. 別ターミナルから personal stage の batch Lambda を起動すると、handler は手元のプロセスで実行されます。

   ```bash
   aws lambda invoke --function-name <BatchFunction の関数名> \
     --cli-binary-format raw-in-base64-out \
     --payload '{"job":"uma-one-draw-topic"}' /dev/stdout
   ```

## ドキュメント

- アーキテクチャ: [docs/architecture.md](docs/architecture.md)
- 実装ルール: [docs/implementation-rules.md](docs/implementation-rules.md)
