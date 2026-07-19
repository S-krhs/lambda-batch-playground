---
paths:
  - "repositories/**"
---

# Repositories

複数 app から参照するデータアクセス境界です。方針・DB・配置の詳細は `repositories/README.md` を参照します。

- DB client、connection string、SQL、テーブル行構造を app へ露出しない。`db/` と `generated/` は package.json の exports に含めない(import 解決エラーを境界の強制に使う)。
- runtime は `DATABASE_URL`(pooled)だけを読む。SST や app 側の resolver に依存しない。
- JSONB は該当 repository 内の Zod schema で保存前と読み出し時の両方を検証する。生成 schema と Prisma の型は公開 API(引数・戻り値)に露出しない。
- 用途固有の公開型・schema・DB 操作を持つ repository は `type.ts`・`schema.ts`・`repository.ts` に分け、integration test は同じディレクトリの `repository.integration.test.ts` に置く。形式を揃えるためだけの空ファイルは作らない。
- 実行ロジック、parser、通知送信、Lambda イベント解釈は置かない。
