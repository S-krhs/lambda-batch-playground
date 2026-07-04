// In scope: UMA ワンドロのお題メッセージ生成に使う設定値を定義する
// Out of scope: お題選択、メッセージ生成、外部送信を行う
/** UMA ワンドロのお題レアリティ。 */
export const TOPIC_RARITIES = ["COMMON", "RARE"] as const;

/** UMA ワンドロで使うお題レアリティ。 */
type TopicRarity = (typeof TOPIC_RARITIES)[number];

/** UMA ワンドロのお題レアリティごとの重み。 */
export const TOPIC_RARITY_WEIGHTS: Readonly<Record<TopicRarity, number>> = {
	COMMON: 9,
	RARE: 1,
};

/** UMA ワンドロのお題候補。 */
export interface TopicEntry {
	rarity: TopicRarity;
	name: string;
}
export const TOPIC_ENTRIES: readonly TopicEntry[] = [
	{ rarity: "COMMON", name: "ホッコータルマエ" },
	{ rarity: "RARE", name: "ダイワスカーレット" },
	{ rarity: "RARE", name: "アーモンドアイ" },
	{ rarity: "RARE", name: "サトノダイヤモンド" },
	{ rarity: "RARE", name: "ナリタトップロード" },
];

/** UMA ワンドロのお題メッセージテンプレート。 */
export const TOPIC_MESSAGE_TEMPLATE =
	"本日のお題は {{selectedName}} になります";
