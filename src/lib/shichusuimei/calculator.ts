import { SolarTime } from 'tyme4ts';
import {
  STEMS, STEM_ELEMENTS, BRANCH_ELEMENTS, STEM_YINYANG, ELEMENT_CYCLE, HOUR_BRANCHES,
  type Stem, type Branch, type Element, type Tsuhensei,
} from './constants';

/** 命式（四柱推命の計算結果） */
export interface Meishiki {
  yearStem: Stem;
  yearBranch: Branch;
  monthStem: Stem;
  monthBranch: Branch;
  dayStem: Stem;
  dayBranch: Branch;
  hourStem: Stem | null;
  hourBranch: Branch | null;
  yearStar: Tsuhensei;
  monthStar: Tsuhensei;
  hourStar: Tsuhensei | null;
  /** 五行バランス（主気のみの整数カウント・UI表示・既存互換） */
  elements: Record<Element, number>;
  /** 五行バランス（蔵干の主気/中気/余気を重み付けした精密値・解析用） */
  elementsWeighted: Record<Element, number>;
}

/**
 * 入力の JST を北京時間に変換して SolarTime を作る。
 *
 * 背景:
 *  - tyme4ts は内部的に北京標準時（UTC+8）で節気を判定する
 *  - JST (UTC+9) は北京時間より 1 時間進んでいる
 *  - 同じ天文瞬間に対応させるには JST の各時刻を -1 時間ずらす
 *
 * これにより:
 *  - 立春・節入りの境界判定がそのまま天文学的に正しくなる
 *  - 日柱の境界（Beijing 23:00 = JST 00:00）も JST 深夜 0 時でちょうど切り替わる
 */
function toBeijingSolarTime(
  year: number, month: number, day: number,
  hour: number, minute: number,
): SolarTime {
  const jstUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - 9 * 3600_000;
  const bj = new Date(jstUtcMs + 8 * 3600_000);
  return SolarTime.fromYmdHms(
    bj.getUTCFullYear(),
    bj.getUTCMonth() + 1,
    bj.getUTCDate(),
    bj.getUTCHours(),
    bj.getUTCMinutes(),
    bj.getUTCSeconds(),
  );
}

/**
 * tyme4ts を使って年柱・月柱・日柱を算出する
 * （節気の境界を天文計算で正確に判定）
 */
function getYearMonthDayPillars(
  year: number, month: number, day: number,
  hour: number, minute: number,
) {
  const t = toBeijingSolarTime(year, month, day, hour, minute);
  const ec = t.getLunarHour().getEightChar();
  return {
    yearStem: ec.getYear().getHeavenStem().getName() as Stem,
    yearBranch: ec.getYear().getEarthBranch().getName() as Branch,
    monthStem: ec.getMonth().getHeavenStem().getName() as Stem,
    monthBranch: ec.getMonth().getEarthBranch().getName() as Branch,
    dayStem: ec.getDay().getHeavenStem().getName() as Stem,
    dayBranch: ec.getDay().getEarthBranch().getName() as Branch,
  };
}

/**
 * 時柱を算出する（JST をそのまま用いる）
 *
 * 日本四柱推命の慣習に従い、子の刻 = JST 23:00-01:00 として判定する。
 * tyme4ts は北京時刻の子の刻で扱うため、JST の時柱とは 1 時間ずれる。
 * したがって時柱は独自計算するのが正しい。
 *
 * 時干は「五子元遁」の規則（日干から時干を起算）に基づく。
 */
function getHourPillar(dayStem: Stem, hour: number, minute: number = 0): { stem: Stem; branch: Branch } {
  const preciseHour = hour + minute / 60;
  // 23:00-01:00=子, 01:00-03:00=丑, ...
  const branchIndex = Math.floor(((preciseHour + 1) % 24) / 2);
  const branch = HOUR_BRANCHES[branchIndex];

  // 甲/己日 → 甲子時, 乙/庚 → 丙子, 丙/辛 → 戊子, 丁/壬 → 庚子, 戊/癸 → 壬子
  const dayStemIndex = STEMS.indexOf(dayStem);
  const baseOffsets = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const stemOffset = baseOffsets[dayStemIndex];
  const stemIndex = (stemOffset + branchIndex) % 10;

  return { stem: STEMS[stemIndex], branch };
}

/**
 * 通変星（十神）を算出する
 */
export function getTsuhensei(dayStem: Stem, targetStem: Stem): Tsuhensei {
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const dayYinyang = STEM_YINYANG[dayStem];
  const targetYinyang = STEM_YINYANG[targetStem];
  const samePolarity = dayYinyang === targetYinyang;

  const dayIdx = ELEMENT_CYCLE.indexOf(dayElement);
  const targetIdx = ELEMENT_CYCLE.indexOf(targetElement);
  const diff = ((targetIdx - dayIdx) + 5) % 5;

  const starMap: Record<number, [Tsuhensei, Tsuhensei]> = {
    0: ['比肩', '劫財'],
    1: ['食神', '傷官'],
    2: ['偏財', '正財'],
    3: ['偏官', '正官'],
    4: ['偏印', '印綬'],
  };

  const [samePol, diffPol] = starMap[diff];
  return samePolarity ? samePol : diffPol;
}

/**
 * 地支の蔵干とその重み（主気・中気・余気）
 * 各地支の重み合計は 1.0 になるよう正規化。
 * 日本四柱推命で標準的に使われる配分。
 * 外部から解析に利用できるよう export する。
 */
export const HIDDEN_STEMS_WEIGHTED: Record<Branch, { stem: Stem; weight: number }[]> = {
  '子': [{ stem: '癸', weight: 1.0 }],
  '丑': [{ stem: '己', weight: 0.5 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.2 }],
  '寅': [{ stem: '甲', weight: 0.5 }, { stem: '丙', weight: 0.3 }, { stem: '戊', weight: 0.2 }],
  '卯': [{ stem: '乙', weight: 1.0 }],
  '辰': [{ stem: '戊', weight: 0.5 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.2 }],
  '巳': [{ stem: '丙', weight: 0.5 }, { stem: '戊', weight: 0.3 }, { stem: '庚', weight: 0.2 }],
  '午': [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
  '未': [{ stem: '己', weight: 0.5 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.2 }],
  '申': [{ stem: '庚', weight: 0.5 }, { stem: '壬', weight: 0.3 }, { stem: '戊', weight: 0.2 }],
  '酉': [{ stem: '辛', weight: 1.0 }],
  '戌': [{ stem: '戊', weight: 0.5 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.2 }],
  '亥': [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }],
};

/**
 * 五行バランス（主気のみの整数カウント）を算出する
 * 既存のUI（円盤・バー）が前提とする従来形式。
 */
function countElementsMain(
  yearStem: Stem, yearBranch: Branch,
  monthStem: Stem, monthBranch: Branch,
  dayStem: Stem, dayBranch: Branch,
  hourStem: Stem | null, hourBranch: Branch | null,
): Record<Element, number> {
  const counts: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const stems: Stem[] = [yearStem, monthStem, dayStem];
  const branches: Branch[] = [yearBranch, monthBranch, dayBranch];
  if (hourStem) stems.push(hourStem);
  if (hourBranch) branches.push(hourBranch);
  for (const s of stems) counts[STEM_ELEMENTS[s]] += 1;
  for (const b of branches) counts[BRANCH_ELEMENTS[b]] += 1;
  return counts;
}

/**
 * 五行バランス（蔵干重み付けの精密値）を算出する
 *
 * - 各天干は 1.0 を自身の五行に加算
 * - 各地支は蔵干（主気0.5-1.0 / 中気0.3 / 余気0.2）の重みを各五行に分配
 *
 * 結果は小数点 1 桁に丸めて返す。地支一つあたりの寄与は合計 1.0。
 */
function countElementsWeighted(
  yearStem: Stem, yearBranch: Branch,
  monthStem: Stem, monthBranch: Branch,
  dayStem: Stem, dayBranch: Branch,
  hourStem: Stem | null, hourBranch: Branch | null,
): Record<Element, number> {
  const counts: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const stems: Stem[] = [yearStem, monthStem, dayStem];
  const branches: Branch[] = [yearBranch, monthBranch, dayBranch];
  if (hourStem) stems.push(hourStem);
  if (hourBranch) branches.push(hourBranch);
  for (const s of stems) counts[STEM_ELEMENTS[s]] += 1;
  for (const b of branches) {
    for (const { stem, weight } of HIDDEN_STEMS_WEIGHTED[b]) {
      counts[STEM_ELEMENTS[stem]] += weight;
    }
  }
  const rounded: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const k of Object.keys(counts) as Element[]) {
    rounded[k] = Math.round(counts[k] * 10) / 10;
  }
  return rounded;
}

/**
 * 経度から真太陽時の補正分（分単位）を算出する
 *
 * 基準子午線 135°E（明石）からの経度差 × 4分/度 で単純補正。
 * 例: 東京 (139.8°E) → +19分, 福岡 (130.4°E) → -18分
 * （均時差 ±16分 までは本関数では扱わない。必要なら追加実装）
 */
export function longitudeOffsetMinutes(longitudeDeg: number): number {
  return (longitudeDeg - 135) * 4;
}

/**
 * 命式を算出するメイン関数
 *
 * - 年柱・月柱・日柱は tyme4ts による節気ベースの正確な算出
 * - 時柱は JST 時刻をそのまま用いた日本四柱推命の慣習に準拠
 * - 時刻未指定の場合は 12:00 JST をデフォルトとし、節気/日境界から
 *   最も離れた時刻で安全寄りに判定する（節気直近や深夜生まれの
 *   精度が必要な場合は時刻入力を推奨）
 * - `timeOffsetMinutes` が指定されると、入力時刻に分単位で加算してから
 *   節気・日柱・時柱を判定する。真太陽時補正や地方時補正の用途。
 */
export function calculateMeishiki(
  year: number,
  month: number,
  day: number,
  hour?: number,
  minute?: number,
  options?: { timeOffsetMinutes?: number },
): Meishiki {
  const hasHour = hour !== undefined;
  const useHour = hasHour ? hour : 12;
  const useMinute = minute ?? 0;
  const offset = options?.timeOffsetMinutes ?? 0;

  // 時刻補正を加味した実効的な (year, month, day, hour, minute) を算出
  const adjMs = Date.UTC(year, month - 1, day, useHour, useMinute, 0) + offset * 60_000;
  const adj = new Date(adjMs);
  const adjYear = adj.getUTCFullYear();
  const adjMonth = adj.getUTCMonth() + 1;
  const adjDay = adj.getUTCDate();
  const adjHour = adj.getUTCHours();
  const adjMinute = adj.getUTCMinutes();

  const { yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch } =
    getYearMonthDayPillars(adjYear, adjMonth, adjDay, adjHour, adjMinute);

  let hourStem: Stem | null = null;
  let hourBranch: Branch | null = null;
  if (hasHour) {
    const hp = getHourPillar(dayStem, adjHour, adjMinute);
    hourStem = hp.stem;
    hourBranch = hp.branch;
  }

  const yearStar = getTsuhensei(dayStem, yearStem);
  const monthStar = getTsuhensei(dayStem, monthStem);
  const hourStar = hourStem ? getTsuhensei(dayStem, hourStem) : null;

  const elements = countElementsMain(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch,
  );
  const elementsWeighted = countElementsWeighted(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch,
  );

  return {
    yearStem, yearBranch,
    monthStem, monthBranch,
    dayStem, dayBranch,
    hourStem, hourBranch,
    yearStar, monthStar, hourStar,
    elements,
    elementsWeighted,
  };
}
