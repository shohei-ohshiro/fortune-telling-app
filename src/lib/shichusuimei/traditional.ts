import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
  type Stem, type Branch,
} from './constants';
import { getTsuhensei } from './calculator';
import { getJuuniun, getHiddenTsuhensei } from './detailed-chart';

export type Era = '令和' | '平成' | '昭和' | '大正' | '明治';

export interface JapaneseEra {
  era: Era;
  eraYear: number;
  /** 伝統的な鑑定書で使われる「平成連続表記」（令和を平成n年として記す） */
  continuousHeiseiYear: number | null;
}

/** 西暦から和暦を計算する */
export function toJapaneseEra(year: number): JapaneseEra {
  const continuousHeiseiYear = year >= 1989 ? year - 1988 : null;
  if (year >= 2019) return { era: '令和', eraYear: year - 2018, continuousHeiseiYear };
  if (year >= 1989) return { era: '平成', eraYear: year - 1988, continuousHeiseiYear };
  if (year >= 1926) return { era: '昭和', eraYear: year - 1925, continuousHeiseiYear };
  if (year >= 1912) return { era: '大正', eraYear: year - 1911, continuousHeiseiYear };
  return { era: '明治', eraYear: year - 1867, continuousHeiseiYear };
}

/** 日柱の六十干支番号（1〜60）を返す */
export function getKanshiNumber(stem: Stem, branch: Branch): number {
  const stemIdx = STEMS.indexOf(stem);
  const branchIdx = BRANCHES.indexOf(branch);
  const junOffset = ((stemIdx - branchIdx + 12) % 12) / 2;
  return stemIdx + Math.floor(junOffset) * 10 + 1;
}

/**
 * 命宮（めいきゅう）を算出する
 * 寅=1, 卯=2, …, 丑=12 と番号付けし、
 * 月支番号 + 時支番号 から命宮支を導く
 */
const INYU_ORDER: Branch[] = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

export interface Meigu {
  stem: Stem;
  branch: Branch;
  tsuhensei: string;
  juuniun: string;
}

export function getMeigu(
  monthBranch: Branch,
  hourBranch: Branch,
  yearStem: Stem,
  dayStem: Stem,
): Meigu {
  const mIdx = INYU_ORDER.indexOf(monthBranch) + 1; // 1..12
  const hIdx = INYU_ORDER.indexOf(hourBranch) + 1;
  let idx = 14 - (mIdx + hIdx);
  if (idx <= 0) idx += 12;
  const branch = INYU_ORDER[idx - 1];

  // 五虎遁：年干から寅月の干を決める
  const yearStemIdx = STEMS.indexOf(yearStem);
  const fuko = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIdx];
  const stemIdx = (fuko + (idx - 1)) % 10;
  const stem = STEMS[stemIdx];

  return {
    stem,
    branch,
    tsuhensei: getTsuhensei(dayStem, stem),
    juuniun: getJuuniun(dayStem, branch),
  };
}

/**
 * 天徳貴人（月支から導く） — 日支との照合で適用
 * 返り値が天干の場合と地支の場合がある
 */
const TENTOKU_BY_MONTH: Record<Branch, Stem | Branch> = {
  '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛',
  '午': '亥', '未': '甲', '申': '癸', '酉': '寅',
  '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚',
};

/** 月徳貴人（月支グループから天干を導く） */
const GETTOKU_BY_MONTH: Record<Branch, Stem> = {
  '寅': '丙', '午': '丙', '戌': '丙',
  '申': '壬', '子': '壬', '辰': '壬',
  '亥': '甲', '卯': '甲', '未': '甲',
  '巳': '庚', '酉': '庚', '丑': '庚',
};

export function getTentoku(monthBranch: Branch): string {
  return String(TENTOKU_BY_MONTH[monthBranch]);
}

export function getGettoku(monthBranch: Branch): Stem {
  return GETTOKU_BY_MONTH[monthBranch];
}

/** 現在年の流年干支を計算する */
export function getRyuunen(year: number): { stem: Stem; branch: Branch } {
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] };
}

/** 順行／逆行大運の大運数（節入りまでの日数を3で割る）— 既存 daiun.ts と整合 */
export interface RyuunenPillar {
  stem: Stem;
  branch: Branch;
  tsuhensei: string;
  juuniun: string;
  hiddenStems: { stem: Stem; tsuhensei: string }[];
}

export function buildRyuunenPillar(
  year: number,
  dayStem: Stem,
): RyuunenPillar {
  const { stem, branch } = getRyuunen(year);
  return {
    stem,
    branch,
    tsuhensei: getTsuhensei(dayStem, stem),
    juuniun: getJuuniun(dayStem, branch),
    hiddenStems: getHiddenTsuhensei(dayStem, branch),
  };
}

/** 五行バランスをレーダー風に描画するためのデータ整形 */
export interface ElementAngle {
  element: '木' | '火' | '土' | '金' | '水';
  label: string;
  count: number;
  ratio: number;
  angleDeg: number;
}

const ELEMENT_ORDER: ElementAngle['element'][] = ['木', '火', '土', '金', '水'];

export function toRadarPoints(counts: Record<ElementAngle['element'], number>): ElementAngle[] {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return ELEMENT_ORDER.map((el, i) => ({
    element: el,
    label: el,
    count: counts[el],
    ratio: counts[el] / total,
    // 上=木、右上=火、右下=土、左下=金、左上=水（五芒星）
    angleDeg: -90 + (360 / 5) * i,
  }));
}

/** 五行 → Tailwind text/stroke color */
export const ELEMENT_STROKE: Record<ElementAngle['element'], string> = {
  '木': '#10b981', '火': '#ef4444', '土': '#d97706', '金': '#737373', '水': '#2563eb',
};

// 未使用警告回避（将来の拡張用）
void STEM_ELEMENTS;
void BRANCH_ELEMENTS;
