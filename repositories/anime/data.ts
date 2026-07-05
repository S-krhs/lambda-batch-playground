// In scope: アニメ指標スクレイピング対象の静的カタログを定義する
// Out of scope: 定義の読み込み、スクレイピング実行、parser 入力変換、外部通知を行う
import type {
	AnimeApiMetricSource,
	AnimeMetricDataSource,
	AnimeWebpageMetricSource,
} from "./types.js";

const bilibiliApiSourceBase = {
	type: "api",
	url: "https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=1",
	itemsPath: "result/list",
	labelPath: "title",
} as const satisfies Omit<AnimeApiMetricSource, "value">;

const bilibiliRankApiSource: AnimeApiMetricSource = {
	...bilibiliApiSourceBase,
	value: {
		type: "path",
		path: "rank",
	},
};

const bilibiliDanmakuApiSource: AnimeApiMetricSource = {
	...bilibiliApiSourceBase,
	value: {
		type: "path",
		path: "stat/danmaku",
	},
};

const bilibiliFollowApiSource: AnimeApiMetricSource = {
	...bilibiliApiSourceBase,
	value: {
		type: "path",
		path: "stat/follow",
	},
};

const bilibiliSeriesFollowApiSource: AnimeApiMetricSource = {
	...bilibiliApiSourceBase,
	value: {
		type: "path",
		path: "stat/series_follow",
	},
};

const bilibiliViewApiSource: AnimeApiMetricSource = {
	...bilibiliApiSourceBase,
	value: {
		type: "path",
		path: "stat/view",
	},
};

const dAnimeApiSourceBase = {
	type: "api",
	url: "https://animestore.docomo.ne.jp/animestore/rest/WS000122?length=200&rankingType=01",
	itemsPath: "data/workList",
	labelPath: "workInfo/workTitle",
} as const satisfies Omit<AnimeApiMetricSource, "value">;

const dAnimeRankApiSource: AnimeApiMetricSource = {
	...dAnimeApiSourceBase,
	value: {
		type: "path",
		path: "rankingInfo/rank",
	},
};

const dAnimeUsersApiSource: AnimeApiMetricSource = {
	...dAnimeApiSourceBase,
	value: {
		type: "path",
		path: "workInfo/myListCount",
	},
};

const dAnimeFavsApiSource: AnimeApiMetricSource = {
	...dAnimeApiSourceBase,
	value: {
		type: "path",
		path: "workInfo/favoriteCount",
	},
};

const dAnimeTotalNumberApiSource: AnimeApiMetricSource = {
	...dAnimeApiSourceBase,
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

const netflixJpTvRankWebpageSource: AnimeWebpageMetricSource = {
	type: "webpage",
	url: "https://www.net-frx.com/p/netflix-popular.html",
	wrapper: {
		selector: ".rank-apo2 .rank-lis-t2",
	},
	itemsSelector: ".netff-not1zz",
	label: {
		selector: "p",
	},
	value: {
		type: "item-index",
	},
};

const netflixJpMovieRankWebpageSource: AnimeWebpageMetricSource = {
	type: "webpage",
	url: "https://www.net-frx.com/p/netflix-popular.html",
	wrapper: {
		selector: ".rank-apo2 .rank-lis-t3",
	},
	itemsSelector: ".netff-not1zz",
	label: {
		selector: "p",
	},
	value: {
		type: "item-index",
	},
};

export const animeMetricDataSources: readonly AnimeMetricDataSource[] = [
	{
		id: "bilibili-night-rank",
		websiteName: "bilibili",
		metricName: "rank",
		timeframe: "night",
		source: bilibiliRankApiSource,
	},
	{
		id: "bilibili-night-view",
		websiteName: "bilibili",
		metricName: "view",
		timeframe: "night",
		source: bilibiliViewApiSource,
	},
	{
		id: "bilibili-night-danmaku",
		websiteName: "bilibili",
		metricName: "danmaku",
		timeframe: "night",
		source: bilibiliDanmakuApiSource,
	},
	{
		id: "bilibili-night-follow",
		websiteName: "bilibili",
		metricName: "follow",
		timeframe: "night",
		source: bilibiliFollowApiSource,
	},
	{
		id: "bilibili-night-series-follow",
		websiteName: "bilibili",
		metricName: "series_follow",
		timeframe: "night",
		source: bilibiliSeriesFollowApiSource,
	},
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
	{
		id: "netflix-jp-tv-morning-rank",
		websiteName: "NetFlixJPTV",
		metricName: "rank",
		timeframe: "morning",
		source: netflixJpTvRankWebpageSource,
	},
	{
		id: "netflix-jp-movie-morning-rank",
		websiteName: "NetflixJPMovie",
		metricName: "rank",
		timeframe: "morning",
		source: netflixJpMovieRankWebpageSource,
	},
];
