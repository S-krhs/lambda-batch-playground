// In scope: Orchestrator Lambda 起動イベントの外部入力 schema と型を提供する
// Out of scope: 起動イベントを使った実行対象の決定、SQS 投入を行う
import { z } from "zod";

/** Orchestrator Lambda が受け取る起動イベント schema。 */
export const orchestratorEventSchema = z.object({
	scheduleHour: z.number().int().min(0).max(23),
});

/** orchestrator が処理する起動スケジュール単位の実行要求。 */
export type OrchestratorEvent = z.infer<typeof orchestratorEventSchema>;
