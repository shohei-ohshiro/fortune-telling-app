import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
  STEM_YINYANG, ELEMENT_CYCLE, MONTH_BRANCHES, HOUR_BRANCHES,
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
  elements: Record<Element, number>;
}

/**
 * 年干支を算出する
 * 西暦年から六十干支を計算
 */
function getYearPillar(year: number): { stem: Stem; branch: Branch } {
  // 天干: (year - 4) % 10 → 甲=0
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  // 地支: (year - 4) % 12 → 子=0
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] };
}

/**
 * 月干支を算出する
 * 年干と月（旧暦基準の簡易版）から計算
 */
function getMonthPillar(yearStem: Stem, month: number): { stem: Stem; branch: Branch } {
  // 月支は固定（節入り日の簡易版: 月-1のインデックス）
  const branch = MONTH_BRANCHES[month - 1];

  // 月干の算出: 年干から起算
  // 甲・己年 → 丙寅月から開始 (stemOffset = 2)
  // 乙・庚年 → 戊寅月から開始 (stemOffset = 4)
  // 丙・辛年 → 庚寅月から開始 (stemOffset = 6)
  // 丁・壬年 → 壬寅月から開始 (stemOffset = 8)
  // 戊・癸年 → 甲寅月から開始 (stemOffset = 0)
  const yearStemIndex = STEMS.indexOf(yearStem);
  const baseOffsets = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const stemOffset = baseOffsets[yearStemIndex];
  // 2月(寅月)を起点として月数分ずらす
  const monthOffset = (month - 2 + 12) % 12;
  const stemIndex = (stemOffset + monthOffset) % 10;

  return { stem: STEMS[stemIndex], branch };
}

/**
 * 日干支を算出する
 * 簡易版: 基準日(2000年1月7日 = 庚辰日)からの日数差で計算
 */
function getDayPillar(year: number, month: number, day: number): { stem: Stem; branch: Branch } {
  const baseDate = new Date(2000, 0, 7); // 2000-01-07 = 庚辰
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 庚 = index 6, 辰 = index 4
  const stemIndex = ((diffDays % 10) + 6 + 10) % 10;
  const branchIndex = ((diffDays % 12) + 4 + 12) % 12;

  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] };
}

/**
 * 時干支を算出する
 */
function getHourPillar(dayStem: Stem, hour: number): { stem: Stem; branch: Branch } {
  // 時支: 23-1時=子, 1-3時=丑, ...
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  const branch = HOUR_BRANCHES[branchIndex];

  // 時干の算出: 日干から起算
  const dayStemIndex = STEMS.indexOf(dayStem);
  const baseOffsets = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const stemOffset = baseOffsets[dayStemIndex];
  const stemIndex = (stemOffset + branchIndex) % 10;

  return { stem: STEMS[stemIndex], branch };
}

/**
 * 通変星（十神）を算出する
 * 日干と対象の天干の関係から求める
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

  // diff: 0=同じ五行, 1=我生, 2=我剋, 3=剋我, 4=生我
  const starMap: Record<number, [Tsuhensei, Tsuhensei]> = {
    0: ['比肩', '劫財'],       // 同じ五行
    1: ['食神', '傷官'],       // 我生（自分が生む）
    2: ['偏財', '正財'],       // 我剋（自分が剋す）
    3: ['偏官', '正官'],       // 剋我（自分を剋す）
    4: ['偏印', '印綬'],       // 生我（自分を生む）
  };

  const [samePol, diffPol] = starMap[diff];
  return samePolarity ? samePol : diffPol;
}

/**
 * 五行のバランスを計算する
 */
function countElements(
  yearStem: Stem, yearBranch: Branch,
  monthStem: Stem, monthBranch: Branch,
  dayStem: Stem, dayBranch: Branch,
  hourStem: Stem | null, hourBranch: Branch | null,
): Record<Element, number> {
  const counts: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  const stems = [yearStem, monthStem, dayStem];
  const branches = [yearBranch, monthBranch, dayBranch];
  if (hourStem) stems.push(hourStem);
  if (hourBranch) branches.push(hourBranch);

  for (const s of stems) counts[STEM_ELEMENTS[s]]++;
  for (const b of branches) counts[BRANCH_ELEMENTS[b]]++;

  return counts;
}

/**
 * 命式を算出するメイン関数
 */
export function calculateMeishiki(
  year: number,
  month: number,
  day: number,
  hour?: number,
): Meishiki {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(yearPillar.stem, month);
  const dayPillar = getDayPillar(year, month, day);

  let hourStem: Stem | null = null;
  let hourBranch: Branch | null = null;
  if (hour !== undefined) {
    const hourPillar = getHourPillar(dayPillar.stem, hour);
    hourStem = hourPillar.stem;
    hourBranch = hourPillar.branch;
  }

  const dayStem = dayPillar.stem;
  const yearStar = getTsuhensei(dayStem, yearPillar.stem);
  const monthStar = getTsuhensei(dayStem, monthPillar.stem);
  const hourStar = hourStem ? getTsuhensei(dayStem, hourStem) : null;

  const elements = countElements(
    yearPillar.stem, yearPillar.branch,
    monthPillar.stem, monthPillar.branch,
    dayStem, dayPillar.branch,
    hourStem, hourBranch,
  );

  return {
    yearStem: yearPillar.stem,
    yearBranch: yearPillar.branch,
    monthStem: monthPillar.stem,
    monthBranch: monthPillar.branch,
    dayStem,
    dayBranch: dayPillar.branch,
    hourStem,
    hourBranch,
    yearStar,
    monthStar,
    hourStar,
    elements,
  };
}
