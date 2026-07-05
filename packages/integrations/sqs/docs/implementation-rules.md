# SQS Integration 実装ルール

- 公開 API は `src/sqs-message-sender.ts` の `SqsMessageSender` と `SqsMessageInput` に限定する。
- `SendMessageBatch` は最大 10 件ずつに分割して送信する。順序は要求しない。
- 送信結果に `Failed` があれば、失敗した message id を含むエラーを throw する。
- AWS SDK など SQS 固有の依存は、この package の `package.json` に追加する。
- `index.ts` とバレルファイルは作らない。
