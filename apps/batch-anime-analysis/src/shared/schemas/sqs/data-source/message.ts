// In scope: worker が受け取る dataSource 単位のアニメスクレイピング要求 message の外部入力 schema と型を提供する
// Out of scope: SQS 送受信、実行対象の決定、起動イベントの正規化を行う
import { z } from "zod";

/** Worker が処理する dataSource 単位のアニメスクレイピング要求 message schema。 */
export const dataSourceMessageSchema = z.object({
	dataSourceId: z.string().min(1),
});

/** Worker が処理する dataSource 単位のアニメスクレイピング要求 message。 */
export type DataSourceMessage = z.infer<typeof dataSourceMessageSchema>;
