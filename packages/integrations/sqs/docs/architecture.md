# SQS Integration アーキテクチャ

`packages/integrations/sqs` は AWS SQS への message 送信境界を担当する package です。

## 責務

- AWS SDK を使った SQS `SendMessageBatch` の呼び出し、batch 分割、送信失敗のエラー変換を置く。
- queue URL の解決、message body の業務形式、ジョブ判定は行わない。
- app 固有の型や feature 固有の値を import しない。

## 依存方向

```text
packages/integrations/sqs -> @aws-sdk/client-sqs
```

- `apps/*` を import しない。
- 別の `packages/integrations/*` を import しない。
- queue URL は呼び出し側が解決して constructor へ渡す。
