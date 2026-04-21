import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS, STEM_YINYANG,
  type Stem, type Branch, type Element,
} from './constants';
import { getTsuhensei, type Meishiki } from './calculator';

/** 蔵干（地支の中に隠れている天干） */
export const HIDDEN_STEMS: Record<Branch, Stem[]> = {
  '子': ['癸'],
  '丑': ['己', '辛', '癸'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

/** 十二運の名称（長生から順に） */
export const JUUNIUN_NAMES = [
  '長生', '沐浴', '冠帯', '建禄', '帝旺', '衰',
  '病', '死', '墓', '絶', '胎', '養',
] as const;
export type Juuniun = typeof JUUNIUN_NAMES[number];

/** 各天干の「長生」地支（十二運の起点） */
const JUUNIUN_BASE: Record<Stem, Branch> = {
  '甲': '亥', '乙': '午',
  '丙': '寅', '丁': '酉',
  '戊': '寅', '己': '酉',
  '庚': '巳', '辛': '子',
  '壬': '申', '癸': '卯',
};

/**
 * 十二運を算出する
 * 陽干は順行、陰干は逆行で地支を辿る
 */
export function getJuuniun(stem: Stem, branch: Branch): Juuniun {
  const baseBranch = JUUNIUN_BASE[stem];
  const baseIdx = BRANCHES.indexOf(baseBranch);
  const targetIdx = BRANCHES.indexOf(branch);
  const isYang = STEM_YINYANG[stem] === '陽';
  const diff = isYang
    ? (targetIdx - baseIdx + 12) % 12
    : (baseIdx - targetIdx + 12) % 12;
  return JUUNIUN_NAMES[diff];
}

/** 日柱干支の六十干支インデックス（甲子=0, 乙丑=1 ...）から空亡ペアを求める */
const VOID_PAIRS: Branch[][] = [
  ['戌', '亥'], // 甲子旬 (0-9)
  ['申', '酉'], // 甲戌旬 (10-19)
  ['午', '未'], // 甲申旬 (20-29)
  ['辰', '巳'], // 甲午旬 (30-39)
  ['寅', '卯'], // 甲辰旬 (40-49)
  ['子', '丑'], // 甲寅旬 (50-59)
];

/**
 * 日柱から空亡（天中殺）を算出する
 * 甲子を 0 とする六十干支の位置から、どの旬に属するかで決まる
 */
export function getKuubou(dayStem: Stem, dayBranch: Branch): Branch[] {
  const stemIdx = STEMS.indexOf(dayStem);
  const branchIdx = BRANCHES.indexOf(dayBranch);
  // 六十干支の番号を求める: stemIdx と branchIdx の差が旬を決める
  // 甲子(0,0) -> 0, 乙丑(1,1) -> 1 ... と進むため (stemIdx - branchIdx) mod 10 で順位を判定
  // より一般的に: 六十干支の位置 = (stemIdx + 10*((branchIdx - stemIdx + 12) mod 12 / 2)) だが、
  // 旬（10刻み）判定は 「stemIdx - branchIdx」 の余りで一意に決まる
  const junIdx = ((stemIdx - branchIdx + 12) % 12) / 2; // 0,1,2,3,4,5 のいずれか
  return VOID_PAIRS[Math.floor(junIdx)];
}

/** 羊刃（日干から見て強すぎる刃のエネルギーを持つ支） */
const YOUJIN_MAP: Record<Stem, Branch> = {
  '甲': '卯', '乙': '辰',
  '丙': '午', '丁': '未',
  '戊': '午', '己': '未',
  '庚': '酉', '辛': '戌',
  '壬': '子', '癸': '丑',
};
export function getYoujin(dayStem: Stem): Branch {
  return YOUJIN_MAP[dayStem];
}

/** 天乙貴人（最大の吉星）— 日干から見て相性の良い二支 */
const TENOTSU_MAP: Record<Stem, Branch[]> = {
  '甲': ['丑', '未'], '乙': ['子', '申'],
  '丙': ['酉', '亥'], '丁': ['酉', '亥'],
  '戊': ['丑', '未'], '己': ['子', '申'],
  '庚': ['丑', '未'], '辛': ['午', '寅'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
};
export function getTenotsu(dayStem: Stem): Branch[] {
  return TENOTSU_MAP[dayStem];
}

/** 納音（六十干支ごとに割り当てられた五行の象徴名） */
const NAYIN_NAMES = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
  '路傍土', '路傍土', '剣鋒金', '剣鋒金', '山頭火', '山頭火',
  '澗下水', '澗下水', '城頭土', '城頭土', '白鑞金', '白鑞金',
  '楊柳木', '楊柳木', '井泉水', '井泉水', '屋上土', '屋上土',
  '霹靂火', '霹靂火', '松柏木', '松柏木', '長流水', '長流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木',
  '壁上土', '壁上土', '金箔金', '金箔金', '覆燈火', '覆燈火',
  '天河水', '天河水', '大駅土', '大駅土', '釵釧金', '釵釧金',
  '桑柘木', '桑柘木', '大渓水', '大渓水', '沙中土', '沙中土',
  '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

/**
 * 六十干支インデックスを計算（甲子=0, 乙丑=1, ..., 癸亥=59）
 */
function getSixtyCycleIndex(stem: Stem, branch: Branch): number {
  const stemIdx = STEMS.indexOf(stem);
  const branchIdx = BRANCHES.indexOf(branch);
  // 六十干支は (stemIdx, branchIdx) が共に 2 ずつ進む
  // 差分から旬を決定
  const junOffset = ((stemIdx - branchIdx + 12) % 12) / 2;
  return stemIdx + Math.floor(junOffset) * 10;
}

export function getNayin(stem: Stem, branch: Branch): string {
  return NAYIN_NAMES[getSixtyCycleIndex(stem, branch)];
}

/** 月令（日干が生まれ月にどれだけエネルギーを得ているか） */
export type Getsurei = '旺' | '相' | '休' | '囚' | '死';

const GETSUREI_LABELS: Record<Getsurei, string> = {
  '旺': '最強（身旺）',
  '相': '強い（助けあり）',
  '休': '休息（停滞）',
  '囚': '抑圧（囚われ）',
  '死': '最弱（無気力）',
};

/**
 * 月令を算出する
 * 月支の五行と日干の五行の関係から決まる
 */
export function getGetsurei(dayStem: Stem, monthBranch: Branch): { state: Getsurei; label: string } {
  const dayElement = STEM_ELEMENTS[dayStem];
  const monthElement = BRANCH_ELEMENTS[monthBranch];
  // 相生・相剋サイクル（五行）
  const cycle: Element[] = ['木', '火', '土', '金', '水'];
  const dayIdx = cycle.indexOf(dayElement);
  const monthIdx = cycle.indexOf(monthElement);
  const diff = (monthIdx - dayIdx + 5) % 5;

  let state: Getsurei;
  if (diff === 0) state = '旺';        // 同じ五行 → 旺（最強）
  else if (diff === 4) state = '相';   // 月が日を生む → 相（助けを得る）
  else if (diff === 1) state = '休';   // 日が月を生む（漏らす） → 休
  else if (diff === 2) state = '囚';   // 日が月を剋す（消耗） → 囚
  else state = '死';                    // 月が日を剋す → 死（最弱）

  return { state, label: GETSUREI_LABELS[state] };
}

/** 蔵干ごとの通変星を求めるヘルパー */
export function getHiddenTsuhensei(dayStem: Stem, branch: Branch) {
  return HIDDEN_STEMS[branch].map((s) => ({
    stem: s,
    tsuhensei: getTsuhensei(dayStem, s),
  }));
}

/** 柱ごとの詳細情報 */
export interface PillarDetail {
  label: string;         // 年柱 / 月柱 / 日柱 / 時柱
  stem: Stem;
  branch: Branch;
  stemTsuhensei: string | null;   // 通変星（日柱はnull）
  juuniun: Juuniun;               // 十二運
  hiddenStems: { stem: Stem; tsuhensei: string }[];  // 蔵干とその通変星
  isKuubou: boolean;              // 空亡に該当するか
  isYoujin: boolean;              // 羊刃に該当するか
  isTenotsu: boolean;             // 天乙貴人に該当するか
}

export interface DetailedChart {
  pillars: PillarDetail[];       // 年・月・日・時（時なしの場合は3柱）
  kuubou: Branch[];              // 空亡の支
  youjin: Branch;                // 羊刃の支
  tenotsu: Branch[];             // 天乙貴人の支
  nayin: string;                 // 日柱の納音
  getsurei: { state: Getsurei; label: string }; // 月令
}

export function buildDetailedChart(meishiki: Meishiki): DetailedChart {
  const { yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch } = meishiki;

  const kuubou = getKuubou(dayStem, dayBranch);
  const youjin = getYoujin(dayStem);
  const tenotsu = getTenotsu(dayStem);

  const pillars: PillarDetail[] = [];

  if (hourStem && hourBranch) {
    pillars.push({
      label: '時柱',
      stem: hourStem,
      branch: hourBranch,
      stemTsuhensei: getTsuhensei(dayStem, hourStem),
      juuniun: getJuuniun(dayStem, hourBranch),
      hiddenStems: getHiddenTsuhensei(dayStem, hourBranch),
      isKuubou: kuubou.includes(hourBranch),
      isYoujin: youjin === hourBranch,
      isTenotsu: tenotsu.includes(hourBranch),
    });
  }

  pillars.push({
    label: '日柱',
    stem: dayStem,
    branch: dayBranch,
    stemTsuhensei: null,
    juuniun: getJuuniun(dayStem, dayBranch),
    hiddenStems: getHiddenTsuhensei(dayStem, dayBranch),
    isKuubou: kuubou.includes(dayBranch),
    isYoujin: youjin === dayBranch,
    isTenotsu: tenotsu.includes(dayBranch),
  });

  pillars.push({
    label: '月柱',
    stem: monthStem,
    branch: monthBranch,
    stemTsuhensei: getTsuhensei(dayStem, monthStem),
    juuniun: getJuuniun(dayStem, monthBranch),
    hiddenStems: getHiddenTsuhensei(dayStem, monthBranch),
    isKuubou: kuubou.includes(monthBranch),
    isYoujin: youjin === monthBranch,
    isTenotsu: tenotsu.includes(monthBranch),
  });

  pillars.push({
    label: '年柱',
    stem: yearStem,
    branch: yearBranch,
    stemTsuhensei: getTsuhensei(dayStem, yearStem),
    juuniun: getJuuniun(dayStem, yearBranch),
    hiddenStems: getHiddenTsuhensei(dayStem, yearBranch),
    isKuubou: kuubou.includes(yearBranch),
    isYoujin: youjin === yearBranch,
    isTenotsu: tenotsu.includes(yearBranch),
  });

  return {
    pillars,
    kuubou,
    youjin,
    tenotsu,
    nayin: getNayin(dayStem, dayBranch),
    getsurei: getGetsurei(dayStem, monthBranch),
  };
}

/** 通変星（十神）それぞれの意味 */
export const TSUHENSEI_MEANINGS: Record<string, { label: string; description: string }> = {
  '比肩': { label: '独立・自我', description: '自分と同じ五行・同じ陰陽。独立心、自信、マイペースの星。仲間意識や競争心をもたらす。' },
  '劫財': { label: '協力・強引', description: '自分と同じ五行・異なる陰陽。仲間との協力で大きく動ける反面、浪費や対立を招きやすい星。' },
  '食神': { label: '創造・楽しみ', description: '自分が生む五行・同じ陰陽。創造力・表現力・食と娯楽を示す。ゆとりと豊かさの星。' },
  '傷官': { label: '表現・鋭さ', description: '自分が生む五行・異なる陰陽。鋭い感性・芸術性・反骨精神。才能豊かだが毒舌にもなりやすい。' },
  '偏財': { label: '流動財・交際', description: '自分が剋す五行・同じ陰陽。流動的なお金・人脈・恋愛。商才と社交性の星。' },
  '正財': { label: '堅実財・配偶者', description: '自分が剋す五行・異なる陰陽。堅実な収入・家庭・配偶者を示す。真面目で誠実な財の星。' },
  '偏官': { label: '行動力・改革', description: '自分を剋す五行・同じ陰陽。七殺とも呼ばれ、強烈な行動力・改革力。困難を突破する星。' },
  '正官': { label: '責任・名誉', description: '自分を剋す五行・異なる陰陽。社会的地位・名誉・規律・責任。公職・管理職の星。' },
  '偏印': { label: '直感・独学', description: '自分を生む五行・同じ陰陽。直感・ひらめき・独学・専門性。変則的な学びの星。' },
  '印綬': { label: '知性・学問', description: '自分を生む五行・異なる陰陽。学問・知識・母性・名誉。正統派の知性の星。' },
};

/** 十二運それぞれの意味 */
export const JUUNIUN_MEANINGS: Record<Juuniun, { label: string; description: string }> = {
  '長生': { label: '誕生', description: '物事が始まり、すくすくと伸びていく時期。素直さと成長のエネルギー。' },
  '沐浴': { label: '浄化', description: '産湯につかる時期。不安定さ・気分屋・芸術的感性の星。' },
  '冠帯': { label: '成人', description: '冠を付けて成人する時期。自我の目覚めと反抗、プライドの星。' },
  '建禄': { label: '自立', description: '独り立ちして役を得る時期。努力家・実力派・安定感の星。' },
  '帝旺': { label: '頂点', description: '人生の最盛期。強いリーダーシップと自信、しかし強すぎると孤立も。' },
  '衰': { label: '下降', description: '頂点を過ぎて静かに落ち着く時期。穏やかさ・思慮深さの星。' },
  '病': { label: '内省', description: '立ち止まって内面を見つめる時期。優しさ・繊細さ・共感力の星。' },
  '死': { label: '静止', description: '活動を止めて精神世界へ向かう時期。研究熱心・集中力・一途さの星。' },
  '墓': { label: '収蔵', description: '蓄える時期。財や知識を貯め込む力。慎重さと執着の星。' },
  '絶': { label: '断絶', description: 'すべてが断たれ白紙に戻る時期。敏感さ・変化・新しい縁の星。' },
  '胎': { label: '宿り', description: '新たな命が宿る時期。可能性・変化を楽しむ星、ただし飽きっぽさも。' },
  '養': { label: '育成', description: '大切に育てられる時期。温厚・受容的・甘え上手の星。' },
};

/** 月令（身旺／身弱の指標）の解説 */
export const GETSUREI_DESCRIPTIONS: Record<Getsurei, string> = {
  '旺': '生まれ月のエネルギーが日干と同じ五行。自分の気が最も満ちる「身旺」の状態で、主体性と行動力が強く出ます。',
  '相': '生まれ月が日干を助ける五行。自然な後押しを受けやすく、人に恵まれながら成長できる配置です。',
  '休': '日干が月のエネルギーを生む（漏らす）関係。才能を発揮する反面、エネルギー消耗にも注意が必要な配置です。',
  '囚': '生まれ月が日干を剋す関係。プレッシャーや抑圧を感じやすい一方、鍛えられて強さを増す配置です。',
  '死': '日干が月を剋す関係。エネルギーを消耗しやすく「身弱」になりがち。休息と周囲の助力が鍵となります。',
};
