import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
  ELEMENT_CYCLE,
  type Stem, type Branch, type Element,
} from './constants';

export interface DailyFortune {
  date: string;
  dayStem: Stem;
  dayBranch: Branch;
  overall: number;   // 1-5
  work: number;      // 1-5
  love: number;      // 1-5
  money: number;     // 1-5
  health: number;    // 1-5
  advice: string;
  luckyColor: string;
  luckyDirection: string;
  luckyNumber: number;
}

/** その日の天干・地支を算出する */
function getDayStemBranch(date: Date): { stem: Stem; branch: Branch } {
  const baseDate = new Date(2000, 0, 7); // 2000-01-07 = 庚辰
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const stemIndex = ((diffDays % 10) + 6 + 10) % 10;
  const branchIndex = ((diffDays % 12) + 4 + 12) % 12;
  return { stem: STEMS[stemIndex], branch: BRANCHES[branchIndex] };
}

/** 五行の相性を計算する（0〜4のスコア） */
function getElementCompatibility(myElement: Element, dayElement: Element): number {
  const myIdx = ELEMENT_CYCLE.indexOf(myElement);
  const dayIdx = ELEMENT_CYCLE.indexOf(dayElement);
  const diff = ((dayIdx - myIdx) + 5) % 5;

  // 0: 同じ（比和）→ 3, 1: 生む → 2, 2: 剋す → 4, 3: 剋される → 1, 4: 生まれる → 4
  const scores: Record<number, number> = { 0: 3, 1: 2, 2: 4, 3: 1, 4: 4 };
  return scores[diff];
}

/** シード値からの擬似ランダム（日付・カテゴリごとに安定した値を返す） */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** 日付をシード値に変換 */
function dateToSeed(date: Date, offset: number = 0): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + offset;
}

const LUCKY_COLORS: Record<Element, string> = {
  '木': '緑', '火': '赤', '土': '黄', '金': '白', '水': '青',
};

const DIRECTIONS: Record<Element, string> = {
  '木': '東', '火': '南', '土': '中央', '金': '西', '水': '北',
};

const ADVICE_TEMPLATES: Record<number, string[]> = {
  1: [
    '今日は無理をせず、休息を大切にしましょう。',
    '慎重に行動することで、トラブルを避けられます。',
    '一人の時間を大切にすると、心が落ち着きます。',
  ],
  2: [
    '焦らずマイペースに過ごすのが吉です。',
    '小さなことから始めると、良い流れが生まれます。',
    '身近な人との会話が、ヒントをくれるでしょう。',
  ],
  3: [
    'バランスの取れた一日になりそうです。',
    '普段通りの行動が、良い結果につながります。',
    '直感を信じて行動すると、良い方向に進みます。',
  ],
  4: [
    '積極的に動くと、良いチャンスに恵まれます。',
    '新しいことに挑戦するのに良い日です。',
    '人との出会いが、あなたの世界を広げてくれます。',
  ],
  5: [
    '大きな決断をするのに最適な日です。',
    'あなたの魅力が最大限に発揮される日です。',
    '長期的な目標に向けて、大きな一歩を踏み出しましょう。',
  ],
};

/**
 * 日運を計算する
 * @param userDayStem ユーザーの日干（命式の日主）
 * @param date 対象日
 */
export function calculateDailyFortune(userDayStem: Stem, date: Date): DailyFortune {
  const { stem: dayStem, branch: dayBranch } = getDayStemBranch(date);
  const userElement = STEM_ELEMENTS[userDayStem];
  const dayElement = STEM_ELEMENTS[dayStem];
  const dayBranchElement = BRANCH_ELEMENTS[dayBranch];

  // 基本スコア
  const baseScore = getElementCompatibility(userElement, dayElement);
  const branchBonus = getElementCompatibility(userElement, dayBranchElement);

  // 各運勢の計算（基本スコア + 日付ベースの変動）
  const seed = dateToSeed(date);
  const variation = (offset: number) => {
    const r = seededRandom(seed + offset);
    return Math.round(r * 2 - 1); // -1, 0, +1
  };

  const clamp = (n: number) => Math.max(1, Math.min(5, n));
  const overall = clamp(Math.round((baseScore + branchBonus) / 2) + variation(1));
  const work = clamp(baseScore + variation(2));
  const love = clamp(Math.round((baseScore + branchBonus) / 2) + variation(3));
  const money = clamp(branchBonus + variation(4));
  const health = clamp(Math.round((baseScore + branchBonus) / 2) + variation(5));

  // ラッキー情報
  const luckyElement = ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(userElement) + 4) % 5]; // 生我の五行
  const luckyColor = LUCKY_COLORS[luckyElement];
  const luckyDirection = DIRECTIONS[luckyElement];
  const luckyNumber = Math.floor(seededRandom(seed + 100) * 9) + 1;

  // アドバイス
  const adviceList = ADVICE_TEMPLATES[overall];
  const adviceIndex = Math.floor(seededRandom(seed + 200) * adviceList.length);
  const advice = adviceList[adviceIndex];

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return {
    date: dateStr,
    dayStem,
    dayBranch,
    overall,
    work,
    love,
    money,
    health,
    advice,
    luckyColor,
    luckyDirection,
    luckyNumber,
  };
}

/** 週間の日運を計算する */
export function calculateWeeklyFortune(userDayStem: Stem, startDate: Date): DailyFortune[] {
  const fortunes: DailyFortune[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    fortunes.push(calculateDailyFortune(userDayStem, date));
  }
  return fortunes;
}
