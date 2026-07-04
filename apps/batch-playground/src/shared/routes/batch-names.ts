// In scope: Batch Playground app で利用できる batch job 名を一元管理する
// Out of scope: ジョブの実装や Lambda イベントの解釈を行う

/** Batch Playground app でサポートする job 名。 */
export const batchNames = {
	umaOneDrawTopic: "uma-one-draw-topic",
} as const;

/** サポートする job 名の union 型。 */
export type BatchName = (typeof batchNames)[keyof typeof batchNames];

/** サポートする job 名の一覧。ルーティング時の検証に使う。 */
export const batchNameList = Object.values(batchNames);
