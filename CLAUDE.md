# Eskra AWS Playground

AWS Lambda と SST でバッチジョブを運用する TypeScript モノレポ(npm workspaces + Turbo)。
実装ルールは `.claude/rules/` にあり、共通 rule は常時、workspace 別 rule は該当ファイルを扱うときに読み込まれる。人間向けの運用マニュアルは `docs/` と各 README。

## 検証

- 変更後は最低限 `npm run typecheck` を実行する。
- import、フォーマット、未使用コードに触れた場合は `npm run lint` も実行する。
- リリース前や複数ファイルを触った場合は `npm run validate`(typecheck + lint + test)を実行する。
- Webhook 実送信を伴う確認は、送信先と環境変数を明示してから行う。

## 慣習

- ログ・エラーメッセージ・ドキュメントは日本語で書く。
- コミットメッセージは `type: 日本語要約` 形式(feat / fix / refactor / docs / chore / infra / ci / style / test / perf)。
- `git add -A` は使わず、対象ファイルを明示して add する。
- フェーズ(意味のある作業単位)ごとに即コミットする。
