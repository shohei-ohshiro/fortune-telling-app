/**
 * 日本の各都道府県の代表的な経度（県庁所在地のおおよその東経値）
 *
 * 四柱推命の真太陽時補正に使う。JST の標準子午線は 135°E（明石）で、
 * これより東 (例: 東京 139.8°) は時刻を進め、西 (例: 福岡 130.4°) は
 * 遅らせることで、出生地の「本当の太陽時」に近づける。
 *
 * 補正量は `longitudeOffsetMinutes(longitude)` で算出できる
 *  ≒ (longitude - 135) × 4 分
 *
 * 注: 均時差（年間で ±16 分程度の変動）は本テーブルでは扱わない。
 */

export interface PrefectureLocation {
  /** 都道府県名 */
  name: string;
  /** 代表都市の経度（°E） */
  longitude: number;
}

export const PREFECTURE_LONGITUDES: Record<string, PrefectureLocation> = {
  hokkaido:  { name: '北海道（札幌）',  longitude: 141.35 },
  aomori:    { name: '青森県',          longitude: 140.74 },
  iwate:     { name: '岩手県',          longitude: 141.15 },
  miyagi:    { name: '宮城県（仙台）',  longitude: 140.87 },
  akita:     { name: '秋田県',          longitude: 140.10 },
  yamagata:  { name: '山形県',          longitude: 140.36 },
  fukushima: { name: '福島県',          longitude: 140.47 },
  ibaraki:   { name: '茨城県（水戸）',  longitude: 140.45 },
  tochigi:   { name: '栃木県（宇都宮）', longitude: 139.88 },
  gunma:     { name: '群馬県（前橋）',  longitude: 139.06 },
  saitama:   { name: '埼玉県',          longitude: 139.65 },
  chiba:     { name: '千葉県',          longitude: 140.12 },
  tokyo:     { name: '東京都',          longitude: 139.77 },
  kanagawa:  { name: '神奈川県（横浜）', longitude: 139.64 },
  niigata:   { name: '新潟県',          longitude: 139.02 },
  toyama:    { name: '富山県',          longitude: 137.21 },
  ishikawa:  { name: '石川県（金沢）',  longitude: 136.66 },
  fukui:     { name: '福井県',          longitude: 136.22 },
  yamanashi: { name: '山梨県（甲府）',  longitude: 138.57 },
  nagano:    { name: '長野県',          longitude: 138.18 },
  gifu:      { name: '岐阜県',          longitude: 136.72 },
  shizuoka:  { name: '静岡県',          longitude: 138.38 },
  aichi:     { name: '愛知県（名古屋）', longitude: 136.91 },
  mie:       { name: '三重県（津）',    longitude: 136.51 },
  shiga:     { name: '滋賀県（大津）',  longitude: 135.87 },
  kyoto:     { name: '京都府',          longitude: 135.76 },
  osaka:     { name: '大阪府',          longitude: 135.52 },
  hyogo:     { name: '兵庫県（神戸）',  longitude: 135.18 },
  nara:      { name: '奈良県',          longitude: 135.83 },
  wakayama:  { name: '和歌山県',        longitude: 135.17 },
  tottori:   { name: '鳥取県',          longitude: 134.24 },
  shimane:   { name: '島根県（松江）',  longitude: 133.05 },
  okayama:   { name: '岡山県',          longitude: 133.93 },
  hiroshima: { name: '広島県',          longitude: 132.46 },
  yamaguchi: { name: '山口県',          longitude: 131.47 },
  tokushima: { name: '徳島県',          longitude: 134.56 },
  kagawa:    { name: '香川県（高松）',  longitude: 134.05 },
  ehime:     { name: '愛媛県（松山）',  longitude: 132.77 },
  kochi:     { name: '高知県',          longitude: 133.53 },
  fukuoka:   { name: '福岡県',          longitude: 130.42 },
  saga:      { name: '佐賀県',          longitude: 130.30 },
  nagasaki:  { name: '長崎県',          longitude: 129.87 },
  kumamoto:  { name: '熊本県',          longitude: 130.74 },
  oita:      { name: '大分県',          longitude: 131.61 },
  miyazaki:  { name: '宮崎県',          longitude: 131.42 },
  kagoshima: { name: '鹿児島県',        longitude: 130.56 },
  okinawa:   { name: '沖縄県（那覇）',  longitude: 127.68 },
};

export type PrefectureKey = keyof typeof PREFECTURE_LONGITUDES;
