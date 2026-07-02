/// <reference path="./.sst/platform/config.d.ts" />

const appName = "lambda-batch-playground";
const NOT_SET = "NOT_SET";
const DEFAULT_UMA_ONE_DRAW_TOPIC_SCHEDULE = "cron(0 21 * * ? *)";
const DEFAULT_UMA_ONE_DRAW_TOPIC_TIMEZONE = "Asia/Tokyo";
const umaOneDrawTopicSchedule =
	process.env.UMA_ONE_DRAW_TOPIC_SCHEDULE ||
	DEFAULT_UMA_ONE_DRAW_TOPIC_SCHEDULE;
const umaOneDrawTopicTimezone =
	process.env.UMA_ONE_DRAW_TOPIC_TIMEZONE ||
	DEFAULT_UMA_ONE_DRAW_TOPIC_TIMEZONE;

export default $config({
	app(input) {
		return {
			name: appName,
			home: "aws",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: input?.stage === "production",
		};
	},
	async run() {
		const batchFunction = new sst.aws.Function("BatchFunction", {
			handler: "src/lambda-handler.handler",
			runtime: "nodejs22.x",
			timeout: "30 seconds",
			memory: "128 MB",
			environment: {
				DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || NOT_SET,
			},
		});

		new sst.aws.CronV2("UmaOneDrawTopicSchedule", {
			function: batchFunction,
			schedule: umaOneDrawTopicSchedule,
			timezone: umaOneDrawTopicTimezone,
			retries: 0,
			event: {
				job: "uma-one-draw-topic",
			},
		});
	},
});
