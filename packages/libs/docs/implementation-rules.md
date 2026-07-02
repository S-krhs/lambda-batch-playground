# Libs 実装ルール

- 純粋関数を基本とし、環境変数、時刻、乱数、HTTP 通信などの副作用を直接扱わない。
- `string`、`date`、`array` など処理の関心でディレクトリを切る。
- `index.ts` とバレルファイルは作らない。
- integration や app の都合が混ざり始めた場合は、引数で関数や interface を受け取る。
