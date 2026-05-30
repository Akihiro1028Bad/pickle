/** 投稿の発信先・一覧フィルタに使う地域。日本47都道府県＋主要海外。 */
export interface RegionGroup {
  label: string;
  regions: string[];
}

export const REGION_GROUPS: RegionGroup[] = [
  { label: "北海道・東北", regions: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { label: "関東", regions: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { label: "中部", regions: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { label: "近畿", regions: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { label: "中国", regions: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { label: "四国", regions: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { label: "九州・沖縄", regions: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
  { label: "海外", regions: ["アメリカ", "カナダ", "イギリス", "オーストラリア", "スペイン", "インド", "その他海外"] },
];

export const ALL_REGIONS: string[] = REGION_GROUPS.flatMap((g) => g.regions);

/** 投稿の地域表示用ラベル。未指定は「全国向け」。 */
export function regionLabel(regions?: string[]): string {
  if (!regions || regions.length === 0) return "全国向け";
  if (regions.length <= 2) return regions.join("・");
  return `${regions[0]}・${regions[1]} +${regions.length - 2}`;
}
