# アーキテクチャ

このドキュメントは、コードの配置、層の責務、依存方向を定義します。
実装時のコメントや JSDoc などの書き方は `docs/implementation-rules.md` を参照します。

## 全体像

このリポジトリは、Lambda イベントの `job` に応じてバッチジョブを実行します。
`src/lambda-handler.ts` が Lambda の入口になり、`src/routing/` がジョブ名を解決し、`src/jobs/` が対象 feature を呼び出します。
`sst.config.ts` が Lambda と EventBridge Scheduler を定義し、定期実行イベントから `job` を渡します。

## 層と責務

| 層 | 置くもの | 置かないもの |
| --- | --- | --- |
| `src/lambda-handler.ts` | Lambda 共通エントリポイント、開始/終了ログ | ジョブ選択条件、業務ロジック、外部連携詳細 |
| `src/routing/` | `job` の取得、正規化、ジョブ名に対応する handler への解決 | 各ジョブの処理内容、メッセージ生成、外部 API 詳細 |
| `src/jobs/` | イベント値の正規化、feature 呼び出し、integration 呼び出し、共通レスポンス作成 | ルーティング判定、内部処理の詳細、外部 API 詳細 |
| `src/features/<concern>/` | 機能単位の処理、ドメイン寄りの値、integration 呼び出し | Lambda イベント解釈、バッチレスポンス作成 |
| `src/integrations/<concern>/` | 外部サービス固有の型、HTTP 通信、外部 API エラー変換 | URL 解決、ジョブ判定、メッセージ生成 |
| `src/shared/infra/` | Lambda など実行基盤に近い共通型・補助処理 | 個別 feature の値、外部サービス固有の型 |
| `src/libs/<concern>/` | ドメイン非依存の純粋な汎用関数 | アプリ層、feature、shared、integration への依存 |
| `src/local-runner.ts` | `.env` を使ったローカル起動 | 本番 Lambda 固有の制御、ジョブ内部処理 |
| `sst.config.ts` | Lambda、EventBridge Scheduler、デプロイ設定 | バッチの業務ロジック、メッセージ生成、外部 API 詳細 |

## 関心ごとのディレクトリ

- `features/`、`integrations/`、`libs/` の直下には実装ファイルを置かず、必ず関心ごとのディレクトリを切る。
- feature はバッチ名や業務機能名で切る。例: `src/features/uma-one-draw-topic/`
- integration は外部サービス名で切る。例: `src/integrations/discord/`
- libs は汎用関数の性質で切る。例: `src/libs/string/`
- `index.ts` は作らない。責務が見えなくなるため、バレルファイルも禁止する。
- ファイル名は責務が一目で分かる名前にする。例: `src/features/uma-one-draw-topic/topic-message.ts`
- 設定値と処理は分ける。例: `topic-settings.ts` と `topic-message.ts`
- 外部サービス内の具体クライアントも用途名のファイルにする。例: `src/integrations/discord/webhook.ts`

## 依存方向

`src/lambda-handler.ts` と `src/routing/` は入口層として `jobs` へ委譲します。
ジョブ以下の依存は左から右へ流します。

```text
jobs -> features -> shared -> integrations -> libs
```

- 右側の層から左側の層を import しない。
- Lambda に関する型は `shared/infra` に置く。
- 外部サービス固有の型は `integrations` に置く。
- 現時点では `shared/domains` を作らない。ドメイン寄りの値は、まず利用する feature の近くに置く。
- `src/shared` 直下には原則ファイルを置かない。
