// In scope: アニメ指標スクレイピング対象の静的カタログを定義する
// Out of scope: 定義の読み込み、スクレイピング実行、parser 入力変換、外部通知を行う
import type {
	AnimeApiMetricSource,
	AnimeMetricDataSource,
	AnimeWebpageMetricSource,
} from "./types.js";

const dAnimeRankApiSource: AnimeApiMetricSource = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
	value: {
		type: "path",
		path: "rankingInfo/rank",
	},
};

const dAnimeUsersApiSource: AnimeApiMetricSource = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
	value: {
		type: "path",
		path: "workInfo/myListCount",
	},
};

const dAnimeFavsApiSource: AnimeApiMetricSource = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
	value: {
		type: "path",
		path: "workInfo/favoriteCount",
	},
};

const dAnimeTotalNumberApiSource: AnimeApiMetricSource = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
	value: {
		type: "path",
		path: "rankingInfo/totalNumber",
	},
};

const myAnimeListMembersWebpageSource: AnimeWebpageMetricSource = {
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
			selector: ".js-members",
		},
	},
};

const myAnimeListScoreWebpageSource: AnimeWebpageMetricSource = {
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

export const animeMetricDataSources: readonly AnimeMetricDataSource[] = [
	{
		id: "danime-night-rank",
		websiteName: "danime",
		metricName: "rank",
		timeframe: "night",
		source: dAnimeRankApiSource,
	},
	{
		id: "danime-night-users",
		websiteName: "danime",
		metricName: "users",
		timeframe: "night",
		source: dAnimeUsersApiSource,
	},
	{
		id: "danime-night-favs",
		websiteName: "danime",
		metricName: "favs",
		timeframe: "night",
		source: dAnimeFavsApiSource,
	},
	{
		id: "danime-night-total-number",
		websiteName: "danime",
		metricName: "total_number",
		timeframe: "night",
		source: dAnimeTotalNumberApiSource,
	},
	{
		id: "my-anime-list-morning-members",
		websiteName: "MyAnimeList",
		metricName: "members",
		timeframe: "morning",
		source: myAnimeListMembersWebpageSource,
	},
	{
		id: "my-anime-list-morning-score",
		websiteName: "MyAnimeList",
		metricName: "score",
		timeframe: "morning",
		source: myAnimeListScoreWebpageSource,
	},
];
