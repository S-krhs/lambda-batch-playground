# Discord Integration 実装ルール

- Discord API の request/response とエラー変換に集中する。
- Webhook URL や token などの secret 値をログやエラーメッセージに含めない。
- 外部 API 失敗は、呼び出し側が原因を区別できる error class に変換する。
- HTTP client や認証 SDK など Discord 固有の依存は、この package の `package.json` に追加する。
- `index.ts` とバレルファイルは作らない。
