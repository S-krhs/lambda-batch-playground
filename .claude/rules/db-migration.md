---
paths:
  - "migration/**"
  - "prisma.config.ts"
  - "repositories/db/**"
---

# DB Migration

Prisma schema と migration の運用ルールです。コマンドと接続文字列の詳細は `migration/README.md` を参照します。

- schema・table の作成・変更は、`CREATE SCHEMA` も含めてすべて Prisma migration で行う(Neon console は読み取りのみ)。
- 破壊的 migration(column の drop / rename / 型変更)を含む PR は、その旨を PR 本文に明記し、レビュー承認を必須とする。
- rollback は forward-only とする。打ち消したい場合は逆向きの migration を新規作成する。
- データの backfill は migration に書かない。一回きりの import は手順書に残し、継続的なものは batch app にする。
- `DIRECT_DATABASE_URL` は migrate 系コマンドだけが使う。CD では migration step の env にだけ渡す。
