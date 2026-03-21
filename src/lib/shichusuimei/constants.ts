// 天干（十干）
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type Stem = typeof STEMS[number];

// 地支（十二支）
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type Branch = typeof BRANCHES[number];

// 天干の読み
export const STEM_READINGS: Record<Stem, string> = {
  '甲': 'きのえ', '乙': 'きのと',
  '丙': 'ひのえ', '丁': 'ひのと',
  '戊': 'つちのえ', '己': 'つちのと',
  '庚': 'かのえ', '辛': 'かのと',
  '壬': 'みずのえ', '癸': 'みずのと',
};

// 地支の読み
export const BRANCH_READINGS: Record<Branch, string> = {
  '子': 'ね', '丑': 'うし', '寅': 'とら', '卯': 'う',
  '辰': 'たつ', '巳': 'み', '午': 'うま', '未': 'ひつじ',
  '申': 'さる', '酉': 'とり', '戌': 'いぬ', '亥': 'い',
};

// 五行
export type Element = '木' | '火' | '土' | '金' | '水';

// 天干の五行
export const STEM_ELEMENTS: Record<Stem, Element> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支の五行（主気のみ）
export const BRANCH_ELEMENTS: Record<Branch, Element> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '未': '土', '丑': '土', '戌': '土',
  '申': '金', '酉': '金',
  '子': '水', '亥': '水',
};

// 天干の陰陽
export const STEM_YINYANG: Record<Stem, '陽' | '陰'> = {
  '甲': '陽', '乙': '陰',
  '丙': '陽', '丁': '陰',
  '戊': '陽', '己': '陰',
  '庚': '陽', '辛': '陰',
  '壬': '陽', '癸': '陰',
};

// 通変星（十神）
export const TSUHENSEI = [
  '比肩', '劫財', '食神', '傷官', '偏財',
  '正財', '偏官', '正官', '偏印', '印綬',
] as const;
export type Tsuhensei = typeof TSUHENSEI[number];

// 五行の相生・相剋関係
// 相生: 木→火→土→金→水→木
// 相剋: 木→土→水→火→金→木
export const ELEMENT_CYCLE: Element[] = ['木', '火', '土', '金', '水'];

// 月支の対応（節入り基準の簡易版）
// 1月=丑, 2月=寅, ... 12月=子
export const MONTH_BRANCHES: Branch[] = [
  '丑', '寅', '卯', '辰', '巳', '午',
  '未', '申', '酉', '戌', '亥', '子',
];

// 時支の対応（2時間ごと）
// 23-1:子, 1-3:丑, 3-5:寅, ...
export const HOUR_BRANCHES: Branch[] = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
];

// 五行の色
export const ELEMENT_COLORS: Record<Element, string> = {
  '木': '#22c55e',
  '火': '#ef4444',
  '土': '#eab308',
  '金': '#f8fafc',
  '水': '#3b82f6',
};
