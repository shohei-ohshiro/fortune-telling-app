import { STEMS, BRANCHES, STEM_YINYANG, type Stem, type Branch } from './constants';

export type Gender = '男' | '女';

export interface DaiunPeriod {
  startAge: number;
  endAge: number;
  stem: Stem;
  branch: Branch;
  stemKeyword: string;
  branchKeyword: string;
}

export interface DaiunResult {
  isForward: boolean;
  startAge: number;
  periods: DaiunPeriod[];
}

// 各月の節入り概算日（その月の「節」= 四柱推命の月始まり）
// index: 月-1 (0=1月/小寒, 1=2月/立春, ..., 11=12月/大雪)
const SETSU_DAY: number[] = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];

const STEM_KEYWORDS: Record<Stem, string> = {
  '甲': '開拓・独立', '乙': '適応・縁', '丙': '輝き・社交', '丁': '直感・情熱',
  '戊': '安定・信頼', '己': '内省・配慮', '庚': '改革・断行', '辛': '洗練・完成',
  '壬': '変化・流動', '癸': '準備・知恵',
};

const BRANCH_KEYWORDS: Record<Branch, string> = {
  '子': '静けさ・準備', '丑': '忍耐・積立', '寅': '前進・挑戦', '卯': '成長・縁',
  '辰': '転換・飛躍', '巳': '集中・探求', '午': '頂点・行動', '未': '実り・絆',
  '申': '機敏・適応', '酉': '完成・磨き', '戌': '誠実・責任', '亥': '内省・充電',
};

function getSetsuDate(year: number, month: number): Date {
  return new Date(year, month - 1, SETSU_DAY[month - 1]);
}

function isForwardDaiun(yearStem: Stem, gender: Gender): boolean {
  const isYang = STEM_YINYANG[yearStem] === '陽';
  return isYang === (gender === '男');
}

/**
 * 生まれた日から最寄り節気までの日数を計算する
 * 順行: 生まれ日 → 次の節入り日
 * 逆行: 生まれ日 → 前の節入り日（逆算）
 */
function getDaysToSetsu(
  year: number, month: number, day: number,
  hour: number, minute: number,
  isForward: boolean,
): number {
  const birthMs = new Date(year, month - 1, day, hour, minute).getTime();

  if (isForward) {
    // 次の節入りを探す
    const thisSetsu = getSetsuDate(year, month);
    if (birthMs < thisSetsu.getTime()) {
      return (thisSetsu.getTime() - birthMs) / 86400000;
    }
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;
    return (getSetsuDate(ny, nm).getTime() - birthMs) / 86400000;
  } else {
    // 直前の節入りを探す
    const thisSetsu = getSetsuDate(year, month);
    if (birthMs >= thisSetsu.getTime()) {
      return (birthMs - thisSetsu.getTime()) / 86400000;
    }
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    return (birthMs - getSetsuDate(py, pm).getTime()) / 86400000;
  }
}

/** 六十干支を steps 分進める（負の場合は戻す） */
function advanceStemBranch(stem: Stem, branch: Branch, steps: number): { stem: Stem; branch: Branch } {
  const si = ((STEMS.indexOf(stem) + steps) % 10 + 10) % 10;
  const bi = ((BRANCHES.indexOf(branch) + steps) % 12 + 12) % 12;
  return { stem: STEMS[si], branch: BRANCHES[bi] };
}

/**
 * 大運を算出する
 * @param year/month/day/hour/minute - 生年月日時分
 * @param gender - 性別
 * @param yearStem - 年干（順逆の判定に使用）
 * @param monthStem/monthBranch - 月柱干支（大運の起点）
 */
export function calculateDaiun(
  year: number, month: number, day: number,
  hour: number, minute: number,
  gender: Gender,
  yearStem: Stem,
  monthStem: Stem,
  monthBranch: Branch,
): DaiunResult {
  const isForward = isForwardDaiun(yearStem, gender);
  const days = getDaysToSetsu(year, month, day, hour, minute, isForward);
  // 大運数 = 節気までの日数 ÷ 3（最小1歳）
  const startAge = Math.max(1, Math.round(days / 3));

  const periods: DaiunPeriod[] = [];
  for (let i = 1; i <= 8; i++) {
    const steps = isForward ? i : -i;
    const { stem, branch } = advanceStemBranch(monthStem, monthBranch, steps);
    periods.push({
      startAge: startAge + (i - 1) * 10,
      endAge: startAge + (i - 1) * 10 + 9,
      stem,
      branch,
      stemKeyword: STEM_KEYWORDS[stem],
      branchKeyword: BRANCH_KEYWORDS[branch],
    });
  }

  return { isForward, startAge, periods };
}
