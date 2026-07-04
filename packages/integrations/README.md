# Packages Integrations

外部サービスとの通信境界を、接続先ごとに package として置く領域です。

## Package

- `discord`: Discord Webhook API との通信境界。

## 置くもの

- 接続先固有の型、HTTP 通信、認証、失敗応答のエラー変換。

## 置かないもの

- Webhook URL や token の解決、ジョブ判定、メッセージ生成。
- app 固有の型や feature 固有の値。
- 別の `packages/integrations/*` への依存。

接続先が増えるたびに package を分けます。重い通信ライブラリや認証 SDK が接続先ごとに増えるためです。
