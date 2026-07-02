# アーキテクチャ

このドキュメントは、モノレポ全体の配置、package 境界、依存方向を定義します。
アプリ固有の構成は `apps/<app>/docs/`、package 固有の構成は各 package の `docs/` を参照します。

## 全体像

このリポジトリは npm workspaces と Turbo で管理する TypeScript モノレポです。
Lambda バッチアプリは `apps/batch-playground/` に置き、外部サービス連携は接続先ごとに `packages/integrations/<target>/` へ分離します。

```text
apps/
  batch-playground/
infra/
packages/
  integrations/
    discord/
  libs/
docs/
```

## Workspace

- `apps/*`: デプロイ単位または実行単位のアプリ。
- `infra/`: SST など、アプリをデプロイするためのインフラ定義。
- `packages/integrations/*`: 外部サービス接続先ごとの integration package。
- `packages/libs`: ドメイン非依存の純粋な汎用処理を置く package。

将来的に複数 app で共有する業務関心が出た場合は、`packages/domain/` を追加できます。
`packages/domain/` は複数 app で共有されるドメインモデル、ルール、ユースケース寄りの純粋処理を置く場所とし、特定 app の Lambda イベント、ルーティング、外部サービス client を持ちません。

## 依存方向

依存は app から package へ流します。

```text
apps/* -> packages/domain/* -> packages/libs
apps/* -> packages/integrations/* -> packages/libs
apps/* -> packages/libs
```

- `packages/libs` から `apps/*`、`packages/domain/*`、`packages/integrations/*` を import しない。
- `packages/domain/*` から `apps/*`、`packages/integrations/*` を import しない。
- `packages/integrations/*` から `apps/*`、`packages/domain/*`、別の `packages/integrations/*` を import しない。
- 外部サービス連携が必要な domain/libs の処理は、呼び出し側から関数や interface を渡す DI で表現する。

## Feature 間依存

- `apps/<app>/src/features/<feature-a>/` から `apps/<app>/src/features/<feature-b>/` を import しない。
- feature 同士を組み合わせる必要がある場合は、`jobs/` など app の orchestration 層で行う。
- 複数 feature で継続的に共有する純粋処理は `packages/libs`、複数 app で共有する業務関心は将来の `packages/domain` へ移す。

## Docs

- `docs/`: モノレポ全体の方針、共通ルール、CI/CD。
- `infra/`: SST app と AWS リソース定義。
- `apps/<app>/docs/`: app 固有の入口、ジョブ、feature、運用。
- `packages/integrations/<target>/docs/`: 接続先固有の integration 設計。
- `packages/libs/docs/`: 汎用処理 package の設計。

## Package 方針

- integration は接続先ごとに package を分ける。重い通信ライブラリや認証 SDK が接続先ごとに増えるため。
- libs は 1 package とし、`packages/libs/src/` は作らない。`packages/libs/<lib-name>/` に実装を置く。
- libs 内の `<lib-name>` は `gacha`、`string`、`date`、`array` など純粋処理の関心で切る。
- 個別 lib に独立した依存や version 管理が必要になった場合だけ、独立 package へ切り出す。
