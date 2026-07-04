// In scope: アニメ指標スクレイピング対象の静的カタログを定義する
// Out of scope: 定義の読み込み、スクレイピング実行、parser 入力変換、外部通知を行う
import type {
	AnimeApiMetricSource,
	AnimeMetricDataSource,
	AnimeWebpageMetricSource,
} from "./types.js";

const dAnimeApiSource: AnimeApiMetricSource = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
	value: {
		type: "path",
		path: "rankingInfo/rank",
	},
};

const myAnimeListWebpageSource: AnimeWebpageMetricSource = {
	type: "webpage",
	url: "https://myanimelist.net/anime/season",
	wrapper: {
		selector: ".js-categories-seasonal",
	},
	itemsSelector: ".title",
	label: {
		selector: ".js-title",
	},
	value: {
		type: "element-text",
		target: {
			selector: ".js-score",
		},
	},
};

export const animeMetricDataSources: AnimeMetricDataSource[] = [
	{
		id: "d-anime-ranking-daily",
		websiteName: "dアニメストア",
		metricName: "ranking",
		timeframe: "daily",
		source: dAnimeApiSource,
	},
	{
		id: "my-anime-list-top-anime-score",
		websiteName: "MyAnimeList",
		metricName: "score",
		timeframe: "seasonal",
		source: myAnimeListWebpageSource,
	},
];
