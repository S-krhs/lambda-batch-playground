// In scope: 遊技チェックリマインダーの Discord 投稿バッチをオーケストレーションする
// Out of scope: リマインダーメッセージ生成や Discord Bot API HTTP 通信の詳細を持つ
import { DiscordBotClient } from "@eskra-aws-playground/integration-discord/discord-bot-client.js";
import { createBatchLogger } from "@eskra-aws-playground/libs/logger/batch-logger.js";
import { Resource } from "sst/resource";

import {
	buildReminderChoicesMessage,
	buildReminderQuestionMessage,
} from "@/features/play-check-reminder/reminder-message.js";
import { REMINDER_CHOICES } from "@/features/play-check-reminder/reminder-settings.js";
import type { BatchResponse } from "@/handlers/batch/schema.js";

const logger = createBatchLogger("play-check-reminder");

/** 遊技チェックリマインダーをボタン付きメッセージとして Discord チャンネルへ投稿するバッチジョブ。 */
export const playCheckReminderJob = async (
	_event: unknown,
): Promise<BatchResponse> => {
	// 1. SST link から Bot token・投稿先チャンネル ID・対象ユーザー ID を解決する。
	const discordBotToken = Resource.YacchoDiscordBotToken.value;
	const discordChannelId = Resource.PlayCheckReminderDiscordChannelId.value;
	const targetUserId = Resource.PlayCheckReminderTargetUserId.value;

	logger.start();

	// 2. 質問メッセージを先に投稿し、続けてボタンのみのメッセージを投稿する。
	try {
		const botClient = new DiscordBotClient(discordBotToken);
		await botClient.postChannelMessage(
			discordChannelId,
			buildReminderQuestionMessage(targetUserId),
		);
		await botClient.postChannelMessage(
			discordChannelId,
			buildReminderChoicesMessage(targetUserId),
		);
	} catch (notificationError) {
		logger.failure(notificationError);
		throw notificationError;
	}

	logger.complete({ choiceCount: REMINDER_CHOICES.length });

	// 3. Lambda ハンドラーへ共通レスポンスを返す。
	return {
		ok: true,
		job: "play-check-reminder",
		details: {
			choiceCount: REMINDER_CHOICES.length,
		},
	};
};
