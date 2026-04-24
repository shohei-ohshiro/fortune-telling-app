import {
  ELEMENT_CYCLE, STEM_YINYANG,
  type Stem, type Branch, type Element,
} from './constants';
import { getTsuhensei, type Meishiki } from './calculator';

/** どの柱同士の因縁かを示す位置ラベル */
export type PillarPos = '年' | '月' | '日' | '時';

/** 発見された「縁」の種別 */
export type BondKind =
  | '干合'     // 天干の合
  | '三合'     // 地支の三合会局
  | '半三合'   // 三合の部分（2支）
  | '六合'     // 地支の六合
  | '支同'     // 同じ地支
  | '沖'       // 相冲
  | '刑'       // 三刑・自刑
  | '害'       // 六害
  | '破';      // 破

export interface CompatibilityBond {
  kind: BondKind;
  /** 因縁の性質 */
  polarity: '吉' | '凶' | '複雑';
  /** 表示名 */
  label: string;
  /** 自分側の柱位置 */
  selfPos: PillarPos;
  /** 相手側の柱位置 */
  otherPos: PillarPos;
  /** 関係する干支 */
  selfKanshi: string;
  otherKanshi: string;
  /** 解説 */
  description: string;
}

export interface ElementCompareRow {
  element: Element;
  self: number;
  other: number;
  diff: number;
  comment: string;
}

export interface DayStarRelation {
  /** 相手→自分 から見た、自分側にとっての通変星（相手の日干は自分にとって何か） */
  fromOtherToSelf: string;
  /** 自分→相手 */
  fromSelfToOther: string;
  description: string;
}

export interface CompatibilityDeepDive {
  /** 日常シーンでの相性（例を含む具体的な描写） */
  daily: string;
  /** 衝突時の傾向と対処例 */
  conflict: string;
  /** 価値観・ライフスタイルの重なりと違い */
  values: string;
  /** コミュニケーションスタイル */
  communication: string;
  /** 長期的な展望（3年・5年スパンでの変化） */
  longTerm: string;
  /** 合計字数（参考値） */
  totalChars: number;
  /** 二人のための具体アドバイス（各400〜800字） */
  practical: CompatibilityPracticalAdvice;
}

export interface CompatibilityPracticalAdvice {
  /** 二人でしたほうがいいこと */
  togetherActivities: string;
  /** 二人で行くといい場所 */
  recommendedPlaces: string;
  /** 一緒に住んだときの関係性 */
  livingRelation: string;
  /** 一緒に住むならどんな場所がいいか */
  livingPlace: string;
  /** おすすめの趣味 */
  hobbies: string;
  /** 合計字数（参考値） */
  totalChars: number;
}

export interface CompatibilityResult {
  bonds: CompatibilityBond[];
  bondScore: number;      // 吉縁による加点
  conflictScore: number;  // 凶縁による減点
  overallScore: number;   // 0〜100 の相性スコア
  karmaStrength: '希薄' | '普通' | '強い' | '非常に強い';
  elementCompare: ElementCompareRow[];
  dayStarRelation: DayStarRelation;
  goodPoints: string[];     // 良い面
  cautionPoints: string[];  // 気をつける面
  differentPoints: string[]; // 異なる面
  summary: string;           // 総評
  deepDive: CompatibilityDeepDive; // 詳細な深掘り分析（合計800字前後）
}

/* ----------------------------------------------------------
 * ── 干合（Stem union） ─────────────────────────────────────
 * ---------------------------------------------------------- */
const STEM_UNIONS: { pair: [Stem, Stem]; label: string; description: string }[] = [
  { pair: ['甲', '己'], label: '甲己の合（中正の合）', description: '誠実さと調和を生む合。お互いに中庸を大切にし、安定した絆を築きやすい。' },
  { pair: ['乙', '庚'], label: '乙庚の合（仁義の合）', description: '義を重んじる合。信頼と公正さが中心にあり、共に道を進むパートナーシップを生む。' },
  { pair: ['丙', '辛'], label: '丙辛の合（威制の合）', description: '威厳と秩序の合。惹かれ合う反面、一方が主導しやすい関係になりがち。' },
  { pair: ['丁', '壬'], label: '丁壬の合（淫溺の合）', description: '情緒的に深く結びつく合。ロマンスや情熱を伴う反面、感情に流されやすい。' },
  { pair: ['戊', '癸'], label: '戊癸の合（無情の合）', description: '年齢差や価値観差を超えて結びつく合。冷静だがドライになりやすい。' },
];

function findStemUnion(a: Stem, b: Stem) {
  return STEM_UNIONS.find(
    (u) => (u.pair[0] === a && u.pair[1] === b) || (u.pair[0] === b && u.pair[1] === a)
  );
}

/* ----------------------------------------------------------
 * ── 三合会局 ───────────────────────────────────────────────
 * ---------------------------------------------------------- */
const SANGOU: { trio: [Branch, Branch, Branch]; element: Element; label: string }[] = [
  { trio: ['寅', '午', '戌'], element: '火', label: '寅午戌の三合（火局）' },
  { trio: ['申', '子', '辰'], element: '水', label: '申子辰の三合（水局）' },
  { trio: ['亥', '卯', '未'], element: '木', label: '亥卯未の三合（木局）' },
  { trio: ['巳', '酉', '丑'], element: '金', label: '巳酉丑の三合（金局）' },
];

function findSangouPair(a: Branch, b: Branch) {
  if (a === b) return null;
  for (const s of SANGOU) {
    if (s.trio.includes(a) && s.trio.includes(b)) return s;
  }
  return null;
}

/* ----------------------------------------------------------
 * ── 六合 ───────────────────────────────────────────────────
 * ---------------------------------------------------------- */
const RIKUGOU: { pair: [Branch, Branch]; label: string }[] = [
  { pair: ['子', '丑'], label: '子丑の六合' },
  { pair: ['寅', '亥'], label: '寅亥の六合' },
  { pair: ['卯', '戌'], label: '卯戌の六合' },
  { pair: ['辰', '酉'], label: '辰酉の六合' },
  { pair: ['巳', '申'], label: '巳申の六合' },
  { pair: ['午', '未'], label: '午未の六合' },
];

function findRikugou(a: Branch, b: Branch) {
  return RIKUGOU.find(
    (r) => (r.pair[0] === a && r.pair[1] === b) || (r.pair[0] === b && r.pair[1] === a)
  );
}

/* ----------------------------------------------------------
 * ── 沖（相冲） ─────────────────────────────────────────────
 * ---------------------------------------------------------- */
const CHONG: [Branch, Branch][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

function findChong(a: Branch, b: Branch) {
  return CHONG.some(([x, y]) => (x === a && y === b) || (y === a && x === b));
}

/* ----------------------------------------------------------
 * ── 害 ─────────────────────────────────────────────────────
 * ---------------------------------------------------------- */
const GAI: [Branch, Branch][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'],
  ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

function findGai(a: Branch, b: Branch) {
  return GAI.some(([x, y]) => (x === a && y === b) || (y === a && x === b));
}

/* ----------------------------------------------------------
 * ── 刑 ─────────────────────────────────────────────────────
 * ---------------------------------------------------------- */
const KEI_PAIRS: { pair: [Branch, Branch]; label: string }[] = [
  { pair: ['寅', '巳'], label: '寅巳の刑（無恩の刑）' },
  { pair: ['巳', '申'], label: '巳申の刑（無恩の刑）' },
  { pair: ['寅', '申'], label: '寅申の刑（無恩の刑）' },
  { pair: ['丑', '戌'], label: '丑戌の刑（恃勢の刑）' },
  { pair: ['戌', '未'], label: '戌未の刑（恃勢の刑）' },
  { pair: ['丑', '未'], label: '丑未の刑（恃勢の刑）' },
  { pair: ['子', '卯'], label: '子卯の刑（無礼の刑）' },
];
const SELF_KEI: Branch[] = ['辰', '午', '酉', '亥'];

function findKei(a: Branch, b: Branch) {
  if (a === b && SELF_KEI.includes(a)) {
    return { label: `${a}${a}の自刑` };
  }
  return KEI_PAIRS.find(
    (k) => (k.pair[0] === a && k.pair[1] === b) || (k.pair[0] === b && k.pair[1] === a)
  );
}

/* ----------------------------------------------------------
 * ── 破 ─────────────────────────────────────────────────────
 * ---------------------------------------------------------- */
const HA: [Branch, Branch][] = [
  ['子', '酉'], ['午', '卯'], ['辰', '丑'],
  ['戌', '未'], ['寅', '亥'], ['巳', '申'],
];

function findHa(a: Branch, b: Branch) {
  // 寅亥・巳申は六合と重なるため、ここでは破としては扱わず六合を優先
  const overlaps: [Branch, Branch][] = [['寅', '亥'], ['巳', '申']];
  if (overlaps.some(([x, y]) => (x === a && y === b) || (y === a && x === b))) return false;
  return HA.some(([x, y]) => (x === a && y === b) || (y === a && x === b));
}

/* ----------------------------------------------------------
 * ── 各柱の情報抽出 ─────────────────────────────────────────
 * ---------------------------------------------------------- */
interface PillarKV { pos: PillarPos; stem: Stem | null; branch: Branch | null; }

function toPillars(m: Meishiki): PillarKV[] {
  return [
    { pos: '年', stem: m.yearStem, branch: m.yearBranch },
    { pos: '月', stem: m.monthStem, branch: m.monthBranch },
    { pos: '日', stem: m.dayStem, branch: m.dayBranch },
    { pos: '時', stem: m.hourStem, branch: m.hourBranch },
  ];
}

/* ----------------------------------------------------------
 * ── 因縁検出メイン ─────────────────────────────────────────
 * ---------------------------------------------------------- */
function detectBonds(self: Meishiki, other: Meishiki): CompatibilityBond[] {
  const bonds: CompatibilityBond[] = [];
  const sp = toPillars(self);
  const op = toPillars(other);

  // ── 天干の干合 ──
  for (const s of sp) {
    if (!s.stem) continue;
    for (const o of op) {
      if (!o.stem) continue;
      const u = findStemUnion(s.stem, o.stem);
      if (u) {
        bonds.push({
          kind: '干合',
          polarity: '吉',
          label: u.label,
          selfPos: s.pos,
          otherPos: o.pos,
          selfKanshi: s.stem,
          otherKanshi: o.stem,
          description: `${s.pos}柱の「${s.stem}」と相手の${o.pos}柱「${o.stem}」が干合。${u.description}`,
        });
      }
    }
  }

  // ── 地支の関係（三合・六合・沖・刑・害・破・支同） ──
  for (const s of sp) {
    if (!s.branch) continue;
    for (const o of op) {
      if (!o.branch) continue;
      const a = s.branch, b = o.branch;

      // 支が同じ
      if (a === b) {
        // 自刑対象以外は「支同」として縁
        if (SELF_KEI.includes(a)) {
          bonds.push({
            kind: '刑',
            polarity: '凶',
            label: `${a}${a}の自刑`,
            selfPos: s.pos, otherPos: o.pos,
            selfKanshi: a, otherKanshi: b,
            description: `同じ地支「${a}」同士でぶつかる自刑。似た者同士ゆえに衝突しやすい配置。`,
          });
        } else {
          bonds.push({
            kind: '支同',
            polarity: '吉',
            label: `${a}${a}の支同`,
            selfPos: s.pos, otherPos: o.pos,
            selfKanshi: a, otherKanshi: b,
            description: `同じ地支「${a}」を共有。感覚が似ていて安心感を得やすい配置。`,
          });
        }
        continue;
      }

      // 六合
      const rk = findRikugou(a, b);
      if (rk) {
        bonds.push({
          kind: '六合',
          polarity: '吉',
          label: rk.label,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `地支の六合。お互いを補い合い、穏やかな結びつきを生む関係。`,
        });
      }

      // 三合（半三合含む）
      const sg = findSangouPair(a, b);
      if (sg) {
        bonds.push({
          kind: '半三合',
          polarity: '吉',
          label: `${a}${b}（${sg.label}の一部）`,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `${sg.element}の三合会局を構成する二支。共通の目的に向かって協力しやすい、強い縁。`,
        });
      }

      // 沖
      if (findChong(a, b)) {
        bonds.push({
          kind: '沖',
          polarity: '凶',
          label: `${a}${b}の沖`,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `正面衝突の関係。刺激的で縁は深いが、すれ違いや対立も起こりやすい。`,
        });
      }

      // 刑
      const kei = findKei(a, b);
      if (kei) {
        bonds.push({
          kind: '刑',
          polarity: '凶',
          label: kei.label,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `刑の関係。表面では穏やかでも、ストレスや矛盾を抱えやすい配置。`,
        });
      }

      // 害
      if (findGai(a, b)) {
        bonds.push({
          kind: '害',
          polarity: '凶',
          label: `${a}${b}の害`,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `害の関係。小さな誤解や不信が積み重なりやすい配置。丁寧な対話が必須。`,
        });
      }

      // 破
      if (findHa(a, b)) {
        bonds.push({
          kind: '破',
          polarity: '複雑',
          label: `${a}${b}の破`,
          selfPos: s.pos, otherPos: o.pos,
          selfKanshi: a, otherKanshi: b,
          description: `破の関係。変化を促し合う刺激的な縁。現状維持にはならない関係性。`,
        });
      }
    }
  }

  // 三合会局がフルで揃うケース（自分の中＋相手の中で3支揃う）もチェック
  const selfBranches = sp.map((p) => p.branch).filter(Boolean) as Branch[];
  const otherBranches = op.map((p) => p.branch).filter(Boolean) as Branch[];
  for (const s of SANGOU) {
    const union = new Set([...selfBranches, ...otherBranches]);
    if (s.trio.every((b) => union.has(b))) {
      // 両者の貢献があるときだけ「因縁」として加える
      const selfHas = s.trio.filter((b) => selfBranches.includes(b)).length;
      const otherHas = s.trio.filter((b) => otherBranches.includes(b)).length;
      if (selfHas >= 1 && otherHas >= 1 && selfHas + otherHas >= 3) {
        bonds.push({
          kind: '三合',
          polarity: '吉',
          label: s.label,
          selfPos: '日', otherPos: '日',
          selfKanshi: s.trio.filter((b) => selfBranches.includes(b)).join(''),
          otherKanshi: s.trio.filter((b) => otherBranches.includes(b)).join(''),
          description: `二人で${s.element}の三合会局を完成させる強力な縁。同じ方向を向いて動くと大きな力を発揮する配置。`,
        });
      }
    }
  }

  return bonds;
}

/* ----------------------------------------------------------
 * ── 五行の比較 ─────────────────────────────────────────────
 * ---------------------------------------------------------- */
function compareElements(self: Meishiki, other: Meishiki): ElementCompareRow[] {
  // 蔵干重み付けの精密値を使用。地支内に隠れた五行まで含めた実質的なバランスを比較する
  return (ELEMENT_CYCLE as Element[]).map((el) => {
    const a = self.elementsWeighted[el];
    const b = other.elementsWeighted[el];
    const diff = a - b;
    // 微量（余気のみ 0.2〜0.3）は「不足」扱いにする閾値
    const scarce = 0.4;
    let comment: string;
    if (a < scarce && b >= 1) {
      comment = `あなたに不足する${el}を相手が補える`;
    } else if (b < scarce && a >= 1) {
      comment = `相手に不足する${el}をあなたが補える`;
    } else if (Math.abs(diff) >= 2.5) {
      comment = `${el}の量に大きな差。バランス感覚に違いが出やすい`;
    } else if (a + b >= 5) {
      comment = `${el}が合計で多く、二人の空間は${el}のテーマで満ちる`;
    } else {
      comment = `${el}の量はバランス良好`;
    }
    return { element: el, self: a, other: b, diff, comment };
  });
}

/* ----------------------------------------------------------
 * ── 日干同士の通変星関係 ───────────────────────────────────
 * ---------------------------------------------------------- */
const DAY_STAR_DESCRIPTIONS: Record<string, string> = {
  '比肩': '対等なライバル。並走できるが主張もぶつかりやすい。',
  '劫財': '似た者同士で刺激的。助け合うか奪い合うかで分かれる関係。',
  '食神': '一緒にいると気が楽で、穏やかに楽しめる関係。',
  '傷官': '才能を引き出し合う刺激。感情の起伏には注意。',
  '偏財': '行動的に動かし合う相性。楽しいが踏み込み過ぎに注意。',
  '正財': '堅実で安定的な相性。生活基盤を築くのに向く。',
  '偏官': 'ピリッと締まる関係。厳しさが成長につながるが疲弊も。',
  '正官': '尊敬と節度の関係。公式な場面で強い絆。',
  '偏印': '独自性を引き出し合う個性派の縁。距離感が難しい。',
  '印綬': '学び・癒しを与え合う関係。精神的な支えになる。',
};

function computeDayStar(self: Meishiki, other: Meishiki): DayStarRelation {
  const fromOtherToSelf = getTsuhensei(self.dayStem, other.dayStem);
  const fromSelfToOther = getTsuhensei(other.dayStem, self.dayStem);
  const desc = DAY_STAR_DESCRIPTIONS[fromOtherToSelf] ?? '';
  const description =
    `あなたから見て相手は「${fromOtherToSelf}」、` +
    `相手から見てあなたは「${fromSelfToOther}」にあたります。${desc}`;
  return { fromOtherToSelf, fromSelfToOther, description };
}

/* ----------------------------------------------------------
 * ── 深掘り分析（各観点の詳細コメント） ──────────────────
 * ---------------------------------------------------------- */

/** 五行ごとのライフスタイル特徴 */
const ELEMENT_LIFESTYLE: Record<Element, { trait: string; weekend: string; valueFocus: string }> = {
  '木': { trait: '成長・開拓志向', weekend: '新しいカフェやイベントを開拓して刺激を受けたい', valueFocus: '挑戦と広がり' },
  '火': { trait: '感情表現豊かで社交的', weekend: '友人と集まってワイワイ盛り上がりたい', valueFocus: '熱量と繋がり' },
  '土': { trait: '安定・家庭志向', weekend: '家でゆっくり過ごしたり身近な人とゆるく会いたい', valueFocus: '安心と継続' },
  '金': { trait: '規律と完成度を重視', weekend: '部屋を整え、やるべきタスクを片付けてスッキリしたい', valueFocus: '整理と本質' },
  '水': { trait: '知的で内省的', weekend: '静かな場所で本を読んだり深い会話をしたい', valueFocus: '理解と柔軟性' },
};

/** 日干通変から導く日常シーン（相手→自分 の通変星をキーに） */
const DAILY_BY_TSUHENSEI: Record<string, (selfStem: Stem, otherStem: Stem) => string> = {
  '印綬': (s, o) =>
    `あなたの日主「${s}」は相手の日主「${o}」から気を受け取る『印綬』の関係。相手はあなたを精神的に支える側になりやすく、例えば仕事で失敗して落ち込んで帰宅した日、相手は責めるような言葉を使わず「先にご飯にしよう」と日常に引き戻してくれます。素直に頼ってよいパートナーです。`,
  '偏印': (s, o) =>
    `相手の日主「${o}」があなたの日主「${s}」を生む『偏印』の関係。相手は見守る側ですが、感情ベッタリではなくドライな気遣い。例えば進路に悩むあなたに対し、相手は正解を押し付けず「自分で決めなよ、何でも応援する」と一歩引いて寄り添います。`,
  '食神': (s, o) =>
    `あなたの日主「${s}」が相手の日主「${o}」を生む『食神』の関係で、あなたが与える側。例えば相手が新しい趣味を始めようとすると、あなたが自然と資料を集めて手渡す役割に。与えすぎて自分のエネルギーが枯れないよう、週1日は自分だけの時間を確保して。`,
  '傷官': (s, o) =>
    `あなたの日主「${s}」が相手の日主「${o}」を生みつつ、感性が鋭く出る『傷官』の関係。例えば相手のプレゼン資料に「そこは違う」と切り込むシーンが起きがちで、相手は最初驚きつつ後で「確かに」と納得。言葉選びを少し柔らかくすると信頼が深まります。`,
  '正官': (_s, o) =>
    `相手の日主「${o}」があなたを律する『正官』の関係。例えばあなたがだらけそうな週末、相手の「そろそろ片付けようか」という一言で背筋が伸びる場面が出ます。厳しさを「うるさい」ではなく「整えてくれる人」と受け取れるかが長続きの鍵。`,
  '偏官': (_s, o) =>
    `相手の日主「${o}」があなたを試す『偏官』の関係。例えば何気ない議論でも本質を突く質問が返ってきて、緊張感のあるやり取りが増えがち。厳しさを成長の糧と捉えられる人には最高の伴走者になり、そうでない人にはやや疲れる相手に。`,
  '正財': (s, _o) =>
    `あなたの日主「${s}」が相手を統べる『正財』の関係で、関係をリードする立場。例えば旅行の計画やお金の使い方であなたが主導し、相手が乗ってくるパターンが自然。相手のペースを尊重する余白を残すと、主導権争いになりません。`,
  '偏財': (_s, _o) =>
    `あなたが『偏財』の位置で相手を動かす関係。例えば行きたい店を見つけたらすぐ誘い、相手は受けて楽しむ形に。あなたの行動力が相手を外の世界に連れ出す反面、踏み込みすぎると疲れさせるので時々「どうしたい？」と聞く意識を。`,
  '比肩': (_s, _o) =>
    `日主が同じ五行の『比肩』の関係で、感覚が近く「言わなくてもわかる」瞬間が多い配置。例えば外食で同じメニューを選んだり、映画の好みが重なったり。ただし譲り合いは苦手で、旅行の日程調整のように両者が主張する場面ではぶつかりやすい面も。`,
  '劫財': (_s, _o) =>
    `日主が五行は同じで陰陽が違う『劫財』の関係で、似ているけれど鏡像のような微妙な差があります。例えば価値観は共通でも仕事のやり方は違い、協力すれば最強、対立すると互いの欠点を指摘し合う泥沼に。距離感の設計が最重要。`,
};

/** 日常シーンの詳細コメント */
function buildDailyNarrative(
  self: Meishiki, other: Meishiki, dayStar: DayStarRelation,
): string {
  const fn = DAILY_BY_TSUHENSEI[dayStar.fromOtherToSelf];
  return fn ? fn(self.dayStem, other.dayStem) : '';
}

/** 衝突時の傾向と対処 */
function buildConflictNarrative(bonds: CompatibilityBond[]): string {
  const byKind = (k: BondKind) => bonds.filter((b) => b.kind === k);
  const dayChong = bonds.find((b) => b.kind === '沖' && b.selfPos === '日' && b.otherPos === '日');
  const anyChong = byKind('沖');
  const anyKei = byKind('刑');
  const anyGai = byKind('害');
  const anyHa = byKind('破');

  if (dayChong) {
    return `日柱同士が『${dayChong.label}』でぶつかる配置。価値観の核心が正反対に寄りやすく、例えば「お金を貯めて将来に備えるか／今やりたいことに使うか」「都会で刺激を受けるか／郊外で落ち着くか」といった人生の大きな分岐で真逆の意見を主張し合う場面が出ます。熱が高いまま議論しない『24時間ルール』を設け、翌日に冷静な頭で再度話すと建設的になります。`;
  }
  if (anyChong.length > 0) {
    const b = anyChong[0];
    const pillarPhrase = b.selfPos === b.otherPos
      ? `${b.selfPos}柱同士`
      : `あなたの${b.selfPos}柱と相手の${b.otherPos}柱`;
    return `${pillarPhrase}に『${b.label}』があり、意見がぶつかる瞬間があります。例えば家族イベントの過ごし方や予定変更の場面で火花が散りやすい配置。ぶつかった直後に決着をつけようとせず、一度その場を離れて散歩するなど物理的距離を取るのが有効。話し合いは翌朝が鉄則です。`;
  }
  if (anyKei.length > 0) {
    return `『${anyKei[0].label}』を含む刑の関係が${anyKei.length}箇所あり、正面衝突しない代わりに鬱積しやすい配置。例えばパートナーの細かな癖（食事中のスマホ、洗い物の残し方）に気づいていても言わずに我慢し、ある日突然「前から言いたかった」と爆発するパターンに注意。週1回5分でいいので「最近モヤッとしたこと」を共有する時間を作るとガス抜きになります。`;
  }
  if (anyGai.length > 0) {
    return `『${anyGai[0].label}』などの害の関係があり、大きな喧嘩は起きにくい反面、小さな行き違いで信頼が削れます。例えば「明日ランチ行く？」の返信が遅れただけで「本当は行きたくないのでは」と裏読みしがち。連絡はこまめに、かつ一言多めに「了解！楽しみ」と添えるだけで関係が安定します。`;
  }
  if (anyHa.length > 0) {
    return `『${anyHa[0].label}』の破があり、現状維持を揺さぶる縁。例えば転職や引越しなど一方が変化を起こすと、もう一方にも連鎖して変化が及びがち。刺激はあるものの、どちらかが落ち着きたい時期には負担に感じることも。節目ごとに二人で方向性を確認する時間を。`;
  }
  return `沖・刑・害・破などの明確な衝突因子は検出されませんでした。大きな喧嘩は稀な穏やかな配置ですが、静かな関係ほど不満が言語化されにくいので、例えば月末に「今月ちょっと気になったこと」を軽く共有する習慣を作ると関係が停滞しません。`;
}

/** 価値観・ライフスタイルの重なりと違い */
function buildValuesNarrative(
  elementCompare: ElementCompareRow[],
): string {
  // 最大量の五行を双方から取得
  const selfTop = [...elementCompare].sort((a, b) => b.self - a.self)[0];
  const otherTop = [...elementCompare].sort((a, b) => b.other - a.other)[0];
  const selfTrait = ELEMENT_LIFESTYLE[selfTop.element];
  const otherTrait = ELEMENT_LIFESTYLE[otherTop.element];
  const missingForSelf = elementCompare.find((r) => r.self < 0.4 && r.other >= 1);
  const missingForOther = elementCompare.find((r) => r.other < 0.4 && r.self >= 1);

  if (selfTop.element === otherTop.element) {
    return `あなたも相手も五行の主役が「${selfTop.element}」（${selfTrait.trait}）で、${selfTrait.valueFocus}という価値観のコアが重なっています。例えば休日には二人とも${selfTrait.weekend}傾向が強く、行動選択に迷いにくい配置。ただし似た者同士のため、第三者の視点（家族や友人）を意識的に取り入れないと、二人の世界に閉じこもって視野が狭くなりやすいので注意。${missingForSelf ? `また、あなたに不足する『${missingForSelf.element}』の気を相手が${missingForSelf.other}持っており、そこが補完ポイントです。` : ''}`;
  }

  let txt = `あなたは「${selfTop.element}」（${selfTop.self}）が最多で${selfTrait.trait}タイプ、相手は「${otherTop.element}」（${otherTop.other}）が最多で${otherTrait.trait}タイプ。例えば休日の過ごし方で、あなたは${selfTrait.weekend}一方、相手は${otherTrait.weekend}ことを求めます。どちらが正しいではなく「役割分担」と捉え、旅行なら前半はあなた主導のアクティブ日・後半は相手主導のリラックス日と分けるとお互い満たされます。`;

  if (missingForSelf) {
    txt += `特にあなたに欠けている『${missingForSelf.element}』を相手が${missingForSelf.other}持っており、これがあなたにとっての大きな癒しの源になります。`;
  } else if (missingForOther) {
    txt += `特に相手に無い『${missingForOther.element}』をあなたが${missingForOther.self}持ち、相手から頼られるポイントに。`;
  }
  return txt;
}

/** コミュニケーションスタイル */
function buildCommunicationNarrative(
  self: Meishiki, other: Meishiki, dayStar: DayStarRelation,
): string {
  const selfYY = STEM_YINYANG[self.dayStem];
  const otherYY = STEM_YINYANG[other.dayStem];
  const bothYang = selfYY === '陽' && otherYY === '陽';
  const bothYin = selfYY === '陰' && otherYY === '陰';

  let base = '';
  if (bothYang) {
    base = `二人とも日主が陽干（あなた「${self.dayStem}」・相手「${other.dayStem}」）で、オープンに言いたいことを出すタイプ同士。例えば意見が割れても率直にぶつけるので誤解は少ない反面、音量と語気が上がりすぎると単なる喧嘩に見えがち。「相手の話が終わってから自分の番」というルールを一つ入れると安定します。`;
  } else if (bothYin) {
    base = `二人とも日主が陰干（あなた「${self.dayStem}」・相手「${other.dayStem}」）で、察する文化が共通。例えば「これが嫌」と直接言わず態度で示すため、読み取りは得意。ただこじれた時に言語化されないまま冷戦になりやすい配置。1週間モヤモヤが続いたら「話す時間」を取る約束があると安全です。`;
  } else {
    const yangSide = selfYY === '陽' ? 'あなた' : '相手';
    const yinSide = selfYY === '陽' ? '相手' : 'あなた';
    base = `${yangSide}が陽干でストレート、${yinSide}が陰干で察するタイプ。例えば「疲れた」の一言でも、${yangSide}は言葉通り受け取り、${yinSide}は「何があったの？」と背景を探る。片方が言語化・片方が察するという役割分担がハマりやすい組み合わせです。`;
  }

  // 通変のニュアンスで一文追加
  const t = dayStar.fromOtherToSelf;
  if (t === '印綬' || t === '偏印') base += `特に相手があなたの話を受け止める側でもあり、愚痴の吐き出し先として機能します。`;
  else if (t === '食神' || t === '傷官') base += `あなたが相手に思い切り話し、相手はそれを楽しむ関係になりやすいです。`;
  else if (t === '正官' || t === '偏官') base += `相手の言葉があなたに効くので、真面目な議論ほど価値が生まれます。`;
  else if (t === '正財' || t === '偏財') base += `あなたが話題を運び、相手がリアクションする形で会話が回ります。`;
  else if (t === '比肩' || t === '劫財') base += `テンポが揃うのでノリの良い会話が続きますが、同じ話題を延々回す癖に注意。`;
  return base;
}

/** 長期的な展望 */
function buildLongTermNarrative(
  overallScore: number,
  karmaStrength: CompatibilityResult['karmaStrength'],
): string {
  let band = '';
  if (overallScore >= 80) {
    band = `スコア${overallScore}点は極上の配置で、例えば10年というスパンで見ても最初の熱量がただ薄れるのではなく、友人・家族・仕事仲間など別の形に変換されて続いていくタイプです。`;
  } else if (overallScore >= 65) {
    band = `スコア${overallScore}点で良好。例えば3年目あたりから「最初のときめき」が「生活の安定」という別の果実に変わり、お互いのいない日常が想像しづらくなります。`;
  } else if (overallScore >= 50) {
    band = `スコア${overallScore}点で、育てる相性。例えば最初の1〜2年は磨き合いの時期で、3年目あたりから急に呼吸が合う典型的な「時間がかかるけど深まる」配置です。`;
  } else if (overallScore >= 35) {
    band = `スコア${overallScore}点で、距離感が鍵の配置。例えば毎日一緒に過ごすより、週末だけ濃く会う、別々の趣味を持つなど「会う時間を濃くする」設計にするほど長続きします。`;
  } else {
    band = `スコア${overallScore}点で刺激重視の配置。例えば短期間で濃く影響を与え合い、人生の転機を作る恋人・友人という役割を担いやすい縁です。`;
  }

  let karma = '';
  if (karmaStrength === '非常に強い' || karmaStrength === '強い') {
    karma = `因縁の強さは『${karmaStrength}』で、切ろうとしても何度も交差する縁。たとえ一度離れても、数年後に仕事や共通の知人を通じて再び繋がる可能性が高いタイプです。この関係から逃げるより、腰を据えて向き合うほうが人生の宿題を終えられます。`;
  } else {
    karma = `因縁の強さは『${karmaStrength}』で、運命的な引力はそこまで強くありません。だからこそ意識的に時間を共有し、小さなイベント（週末の食事、記念日の共有）を積み重ねることで関係が育っていきます。`;
  }
  return band + karma;
}

/* ----------------------------------------------------------
 * ── 具体アドバイス（活動／場所／住まい／趣味） ──────────
 * ---------------------------------------------------------- */

/** 五行ごとのライフスタイル要素（活動・場所・住まい・趣味） */
const ELEMENT_ACTIVITIES: Record<Element, {
  together: string; place: string; livingPlace: string; hobby: string; interior: string;
}> = {
  '木': {
    together: '植物園めぐり・新しい街の散策・ハーブ栽培など成長を感じる活動',
    place: '京都の寺社、高原リゾート、ガーデンや植物園、森の中のカフェ',
    livingPlace: '大きな公園の近く、街路樹の多い住宅街、緑のベランダを作れる広さ',
    hobby: '家庭菜園、キャンプ、登山、盆栽、ガーデニング',
    interior: '植物を育てたり木製家具を取り入れる',
  },
  '火': {
    together: 'フェスやライブ観戦・ホームパーティ・食べ歩きなど熱量の高い活動',
    place: '夜景のきれいな高台、賑わう繁華街、花火大会、サウナ',
    livingPlace: '駅近の活気ある街、南向きで日当たりの良い部屋、大きな窓のあるリビング',
    hobby: 'ダンス、料理教室、スポーツ観戦、写真、音楽制作',
    interior: 'キャンドルを灯したり暖色系ライトを増やす',
  },
  '土': {
    together: '温泉旅行・陶芸体験・古民家ステイなどゆったりと身体を労わる活動',
    place: '温泉地、田園の広がる里、古都の街並み、和菓子や老舗の喫茶',
    livingPlace: '郊外の静かな住宅街、庭付きや広いリビングのある戸建て',
    hobby: '陶芸、パン作り、ガーデニング、書道、のんびりドライブ',
    interior: '陶器や土器、アースカラーの布を飾る',
  },
  '金': {
    together: '美術館・博物館めぐり、クラシック鑑賞、部屋を一緒に整えるなど整うを楽しむ活動',
    place: '美術館・ギャラリー、設計の美しいホテル、神社仏閣、ジュエリー店',
    livingPlace: '整った新築マンション、ミニマルで機能的な住まい、整然とした区画',
    hobby: '書道、茶道、古美術収集、ミニマルライフ、ワインやウィスキー鑑賞',
    interior: '金属系アートやシャープな照明で整える',
  },
  '水': {
    together: '図書館で静かに読書・深夜の語り合い・映画三昧など内省を深める活動',
    place: '海辺のリゾート、湖畔、水族館、深夜の静かなバー、露天のある温泉',
    livingPlace: '川や海の近く、夜景の見える高層階、落ち着いた住宅地',
    hobby: '読書会、映画鑑賞、瞑想、釣り、アクアリウム、じっくり対話',
    interior: '小さな水槽や水音の出るオブジェを置く',
  },
};

/** 二人でしたほうがいいこと */
function buildTogetherActivityNarrative(
  elementCompare: ElementCompareRow[],
  dayStar: DayStarRelation,
  bonds: CompatibilityBond[],
): string {
  const selfTop = [...elementCompare].sort((a, b) => b.self - a.self)[0];
  const otherTop = [...elementCompare].sort((a, b) => b.other - a.other)[0];
  const selfAct = ELEMENT_ACTIVITIES[selfTop.element];
  const otherAct = ELEMENT_ACTIVITIES[otherTop.element];
  const sameTop = selfTop.element === otherTop.element;
  const hasSangou = bonds.some((b) => b.kind === '三合');
  const hasRikugouDay = bonds.some((b) => b.kind === '六合' && b.selfPos === '日' && b.otherPos === '日');
  const t = dayStar.fromOtherToSelf;

  const parts: string[] = [];

  if (sameTop) {
    // 主役が重なる場合は、相手側の2番目の五行を引き出してバランスを取る
    const otherSecond = [...elementCompare].sort((a, b) => b.other - a.other)[1];
    const secondAct = ELEMENT_ACTIVITIES[otherSecond.element];
    parts.push(`二人とも五行の主役が「${selfTop.element}」で、${selfAct.together}に深く共鳴するタイプ。似た感覚を持つからこそ、意識的に「新しい刺激」を一緒に取りに行くことが関係のマンネリ化を防ぐ最大のコツです。`);
    parts.push(`【おすすめ①】${selfAct.together}。二人の共通言語になるコア活動。週1回ペースでリズム化すると関係の土台になります。`);
    parts.push(`【おすすめ②】${secondAct.together}。相手の2番目の気「${otherSecond.element}」を活かす活動で、相手の意外な一面を引き出しつつ、同じ気に偏りすぎないバランスを取れます。`);
    parts.push(`【おすすめ③】月に1度は「初めての場所・初めての体験」を二人で開拓する時間を作ること。似た者同士の二人が視野狭窄に陥らないための大切な予防策です。`);
  } else {
    parts.push(`あなたの主役は「${selfTop.element}」、相手の主役は「${otherTop.element}」と五行が異なります。それぞれの気が満ちる時間を交互に用意することで、どちらかだけが我慢する関係を避けられます。`);
    parts.push(`【おすすめ①】${selfAct.together}。あなたの気が充電される活動に相手を誘うと、自然体のあなたを見せられ、相手もあなたの素顔に触れられます。`);
    parts.push(`【おすすめ②】${otherAct.together}。相手の得意領域に同行すると、普段気づかない相手のイキイキとした表情を発見できます。`);
    parts.push(`【おすすめ③】月に1度は「初めての場所・初めての体験」を二人で開拓する時間を作ること。マンネリ予防と、共通の思い出のストック作りに直結します。`);
  }

  if (t === '食神' || t === '傷官') {
    parts.push(`日干関係が『${t}』のため、あなたが作って相手が味わう構図が自然。料理・ハンドメイド・旅行の計画など「あなたが提供し相手が楽しむ」形の活動が特に盛り上がります。`);
  } else if (t === '印綬' || t === '偏印') {
    parts.push(`日干関係が『${t}』で、相手があなたを支える流れ。相手の得意分野を教わる・相手の実家の料理を学ぶなど「受け取る」タイプの時間が二人を深く結びます。`);
  } else if (t === '正官' || t === '偏官') {
    parts.push(`日干関係が『${t}』で、相手の言葉があなたを律する構図。資格試験・ダイエット・マラソンなど「共通の目標達成」系に取り組むと、相手が最強のコーチになります。`);
  } else if (t === '正財' || t === '偏財') {
    parts.push(`日干関係が『${t}』で、あなたが仕切る構図。旅行や企画を主導しつつ、選択肢を3つ提示して相手に選んでもらう形にすると、押しつけ感が消えて対等になります。`);
  } else {
    parts.push(`日主が近い『${t}』の関係で、ボードゲーム・スポーツ・楽器セッションなど「同じリズムを刻む」活動が特にハマります。テンポが揃うので息の合った連携が楽しめます。`);
  }

  if (hasSangou) {
    parts.push(`二人で三合会局を成す強い縁があるため、「共通の長期目標」を掲げて動くとシナジーが最大化。貯金・勉強・ダイエットなど、一緒に始めたことは想像以上の成果を生みます。`);
  } else if (hasRikugouDay) {
    parts.push(`日柱の六合があり、お互いの欠けを埋め合う関係。家事や旅行の役割分担など「補完し合う動き」が自然に機能するので、あえて分担を明確化すると心地よさが増します。`);
  }

  return parts.join('\n\n');
}

/** 二人で行くといい場所 */
function buildRecommendedPlacesNarrative(
  elementCompare: ElementCompareRow[],
  bonds: CompatibilityBond[],
): string {
  const selfTop = [...elementCompare].sort((a, b) => b.self - a.self)[0];
  const otherTop = [...elementCompare].sort((a, b) => b.other - a.other)[0];
  const missingForBoth = elementCompare.find((r) => r.self + r.other <= 1);
  const selfAct = ELEMENT_ACTIVITIES[selfTop.element];
  const otherAct = ELEMENT_ACTIVITIES[otherTop.element];
  const strongLucky = bonds.filter((b) => b.polarity === '吉').length >= 3;

  const parts: string[] = [];

  parts.push(`二人の五行バランスから「気が整う場所」「魅力が引き出される場所」を紹介します。訪れる場所の気と命式の気が共鳴すると、関係のステージが上がります。`);

  if (selfTop.element === otherTop.element) {
    const otherSecond = [...elementCompare].sort((a, b) => b.other - a.other)[1];
    const secondPlace = ELEMENT_ACTIVITIES[otherSecond.element].place;
    parts.push(`【二人の主役「${selfTop.element}」が映える場所】${selfAct.place}。同じ気を好む二人には「行くと確実に機嫌が良くなる鉄板スポット」となります。定番として2〜3箇所ストックしておくと便利。`);
    parts.push(`【相手の裏テーマ「${otherSecond.element}」を満たす場所】${secondPlace}。相手の二番目の気に触れる場所へ行くと、普段見えない表情が出てきます。主役だけでは気づけない相手の奥行きを発見できます。`);
  } else {
    parts.push(`【あなたが輝く場所】${selfAct.place}。あなたのエネルギーが充電される場所に相手を案内すると、普段見せない表情や本音が自然に出てきます。`);
    parts.push(`【相手が輝く場所】${otherAct.place}。相手が元気になる場所に合わせることで、相手の新しい魅力が見え、あなた自身の世界も広がります。`);
  }

  if (missingForBoth) {
    const missPlace = ELEMENT_ACTIVITIES[missingForBoth.element].place;
    parts.push(`【二人に不足する「${missingForBoth.element}」を補う場所】${missPlace}。二人の命式に薄い気を浴びに行くと、関係の盲点が埋まります。年2〜3回のペースで意識的に訪れるのが吉。`);
  } else {
    parts.push(`【迷ったら訪れる場所】神社仏閣・温泉地・高原リゾートは五行が整う中立的な場所で、喧嘩した後の仲直り旅行や、大きな決断の前にもおすすめです。`);
  }

  if (strongLucky) {
    parts.push(`吉縁が豊富な二人には、歴史あるパワースポット（伊勢・出雲・京都・鎌倉・沖縄の御嶽など）への旅が特に効果的。強い縁が場所の気と響き合い、二人の関係が一段深まる体験になります。`);
  } else {
    parts.push(`車で1時間圏内に「二人の聖地」を1つ決めておくと関係が安定します。公園・温泉・美術館など、気軽に通える定番を作り、月1で訪れるリズムを大切に。`);
  }

  parts.push(`【逆に避けたい場所】二人の気が偏って強まりすぎる場所（「火」が強い二人が真夏の屋外フェスばかり選ぶなど）は疲労の原因に。季節ごとに行き先のテーマを変え、バランスを取るのが長続きのコツです。`);

  return parts.join('\n\n');
}

/** 一緒に住んだときの関係性 */
function buildLivingRelationNarrative(
  self: Meishiki, other: Meishiki,
  dayStar: DayStarRelation,
  bonds: CompatibilityBond[],
): string {
  const selfYY = STEM_YINYANG[self.dayStem];
  const otherYY = STEM_YINYANG[other.dayStem];
  const bothYang = selfYY === '陽' && otherYY === '陽';
  const bothYin = selfYY === '陰' && otherYY === '陰';
  const t = dayStar.fromOtherToSelf;
  const hasKei = bonds.some((b) => b.kind === '刑');
  const hasChong = bonds.some((b) => b.kind === '沖');
  const hasGou = bonds.some((b) => b.kind === '干合' || b.kind === '六合' || b.kind === '三合' || b.kind === '半三合');

  const parts: string[] = [];

  parts.push(`同居したときに立ち上がる二人の空気感・役割分担・注意点を、日主の陰陽と通変星から読み解きます。実際の生活で起こりやすいシーンを想定しながら読んでみてください。`);

  if (bothYang) {
    parts.push(`【空気感】二人とも陽干（「${self.dayStem}」と「${other.dayStem}」）で、家の中は明るく活発。音楽や話し声がよく響き「帰ると元気が出る家」になります。ただしテンションが常に高めなので、意識的に"静けさの時間"を設計しないと疲弊します。`);
  } else if (bothYin) {
    parts.push(`【空気感】二人とも陰干（「${self.dayStem}」と「${other.dayStem}」）で、家の中は静かで落ち着いた雰囲気。隣で本を読んでいても気まずくならない二人ですが、モヤモヤが言葉にならないまま溜まりがち。週1の会話時間で安定します。`);
  } else {
    parts.push(`【空気感】陽干と陰干の組み合わせ（「${self.dayStem}」と「${other.dayStem}」）で、家の中に活発さと静けさが共存。片方が賑やかに話し、片方が受け止める自然な役割分担が生まれる、居心地のいい空間になります。`);
  }

  if (t === '印綬' || t === '偏印') {
    parts.push(`【役割】相手があなたを支える『${t}』の構図。家での相手は"心の充電器"になり、仕事で疲れた日ほど帰宅するとホッとできます。甘えすぎて相手が消耗しないよう、月1で相手が完全に一人になれる時間を贈るのがバランス。`);
  } else if (t === '食神' || t === '傷官') {
    parts.push(`【役割】あなたが相手を生かす『${t}』の構図。料理・家事・段取りなど、あなたが"供給する側"になる場面が多めです。与えすぎて空っぽにならないよう、相手に甘える時間も意識的に確保しましょう。`);
  } else if (t === '正官' || t === '偏官') {
    parts.push(`【役割】相手があなたを律する『${t}』の構図。生活リズム・家計・ルールなど相手のペースが基準になりがち。合理的なら快適ですが、息苦しさを感じたら早めに話し合い、ルールを見直すのが鉄則です。`);
  } else if (t === '正財' || t === '偏財') {
    parts.push(`【役割】あなたが主導する『${t}』の構図。家計・休日・インテリアなどの意思決定はあなたが中心に。相手は寛大に乗ってくれますが、決定を独占しすぎないよう「相手が決める領域」を1〜2つ確保して。`);
  } else {
    parts.push(`【役割】日主が近い『${t}』の関係で、対等なルームメイトのような距離感。家事分担や空間の使い方でぶつかりやすいので、同居初期に「担当制」を明文化すると揉め事が激減します。`);
  }

  if (hasKei || hasChong) {
    parts.push(`【注意点】沖や刑の縁を持っているため、狭い空間で24時間一緒にいると摩擦が出やすい配置です。ワンルームではなく1LDK以上で、お互いが1人になれる小さなコーナーを確保することが同居成功の必須条件になります。`);
  } else if (hasGou) {
    parts.push(`【強み】合の縁が豊富なので、一緒に過ごす時間が長いほど絆が深まるタイプ。リビング中心の間取りで自然と顔を合わせる設計が特に相性良好です。`);
  } else {
    parts.push(`【相性】同居のストレスも強すぎる惹きつけもなく、ほどよい距離感で穏やかに暮らせる二人。ルールを縛りすぎず、お互いのペースを尊重するくらいがちょうど良い配置です。`);
  }

  parts.push(`【同居のコツ】最初の3ヶ月で"お互いの譲れない生活ルール"を3つずつ書き出して共有するのが鉄則。音量・清潔さ・時間感覚など細部の擦り合わせを先にやるほど、後の揉め事が激減します。${hasGou ? '縁が深い二人ほど甘えがちなので、最初が肝心。' : '大きな縁に頼らない関係だからこそ、ルールの明文化が安定剤になります。'}`);

  return parts.join('\n\n');
}

/** 一緒に住むならどんな場所がいいか */
function buildLivingPlaceNarrative(
  elementCompare: ElementCompareRow[],
  bonds: CompatibilityBond[],
): string {
  const selfTop = [...elementCompare].sort((a, b) => b.self - a.self)[0];
  const otherTop = [...elementCompare].sort((a, b) => b.other - a.other)[0];
  const missing = elementCompare.find((r) => r.self + r.other <= 1);
  const selfAct = ELEMENT_ACTIVITIES[selfTop.element];
  const otherAct = ELEMENT_ACTIVITIES[otherTop.element];
  const sameTop = selfTop.element === otherTop.element;
  const hasKei = bonds.some((b) => b.kind === '刑');
  const hasChong = bonds.some((b) => b.kind === '沖');

  const parts: string[] = [];

  parts.push(`二人の五行バランスから、住まい選びで押さえたい条件を紹介します。立地・間取り・方角の3軸で見ていきましょう。`);

  if (sameTop) {
    parts.push(`【立地】二人とも主役が「${selfTop.element}」なので、${selfAct.livingPlace}が最適。同じ気を好むため物件選びで揉めにくい反面、その気に偏りすぎる物件は疲労を招きやすいので、逆の要素も少し混ぜると長持ちします。`);
  } else {
    parts.push(`【立地】あなたは「${selfTop.element}」系（${selfAct.livingPlace}）、相手は「${otherTop.element}」系（${otherAct.livingPlace}）が心地良い配置。両方の条件を少しずつ満たす立地が理想です。例えば駅から少し離れて静かだがカフェやスーパーは徒歩圏という街がバランス良好。`);
  }

  if (missing) {
    const missAct = ELEMENT_ACTIVITIES[missing.element];
    parts.push(`【補強ポイント】二人の命式に不足する「${missing.element}」の気を、家や近所で補えると関係が安定します。${missAct.interior}のような小さな工夫だけでも効果があり、散歩圏内に${missing.element === '木' ? '公園' : missing.element === '水' ? '川や池' : missing.element === '火' ? '陽当たりの良い開けた場所' : missing.element === '土' ? '畑や広場' : '整った街並み'}があるとベター。`);
  }

  if (hasKei || hasChong) {
    parts.push(`【間取り】摩擦因子があるため、リビングとは別に「それぞれの逃げ場」になる小部屋・書斎コーナーが必須。1LDK以上、できれば2DK以上で、お互いが別作業を同時にできる設計にすると長く穏やかに暮らせます。`);
  } else {
    parts.push(`【間取り】衝突因子が少なく、リビング中心の間取りで顔を合わせる時間が長くても疲れにくい配置。ただし将来のライフステージ変化を見越して、1部屋は"用途自由"な予備室を持っておくと柔軟性が増します。`);
  }

  const dominantEl = sameTop ? selfTop.element :
    [selfTop.element, otherTop.element].includes('木') ? '木' :
    [selfTop.element, otherTop.element].includes('火') ? '火' :
    [selfTop.element, otherTop.element].includes('土') ? '土' :
    [selfTop.element, otherTop.element].includes('金') ? '金' : '水';
  const dir: Record<Element, string> = {
    '木': '東〜北東（朝日が差す向き）', '火': '南向きで日当たり重視',
    '土': '南西〜北東の安定した方位', '金': '西向き、または整然とした区画',
    '水': '北向きで水辺を臨む立地',
  };
  parts.push(`【方角のヒント】${dir[dominantEl]}が、二人の気にもっとも合いやすい方角です。あくまで目安ですが、候補が複数あって迷ったときの判断材料として使えます。`);

  parts.push(`【予算より優先すべき条件】二人の場合、駅距離や広さより「気が整う環境」のほうが長期満足度に直結します。少し予算オーバーでも、上記の立地・方角・間取り条件を満たすほうが、結果的に関係の質を守る投資になります。`);

  return parts.join('\n\n');
}

/** おすすめの趣味 */
function buildHobbyNarrative(
  elementCompare: ElementCompareRow[],
  dayStar: DayStarRelation,
  bonds: CompatibilityBond[],
): string {
  const selfTop = [...elementCompare].sort((a, b) => b.self - a.self)[0];
  const otherTop = [...elementCompare].sort((a, b) => b.other - a.other)[0];
  const missing = elementCompare.find((r) => r.self + r.other <= 1);
  const selfAct = ELEMENT_ACTIVITIES[selfTop.element];
  const otherAct = ELEMENT_ACTIVITIES[otherTop.element];
  const t = dayStar.fromOtherToSelf;
  const hasSangou = bonds.some((b) => b.kind === '三合');

  const parts: string[] = [];

  parts.push(`二人の五行と通変星から、一緒に育てると相性の良い趣味を提案します。「共通の熱中できる何か」を持つ二人は、時間の経過とともに絆が深まっていきます。`);

  if (selfTop.element === otherTop.element) {
    parts.push(`【メイン趣味】二人の主役「${selfTop.element}」にちなんだ${selfAct.hobby}から1つを共通の軸に。予算・時間・生活リズムに合うものを選び、週1回以上コンスタントに触れられる形にできると最も長続きします。`);
  } else {
    parts.push(`【メイン趣味】${selfAct.hobby}または${otherAct.hobby}の中から、予算・時間・生活リズムに合うものを1つ選び共通の軸に。週1回以上コンスタントに触れられる趣味が最も長続きします。`);
  }

  if (missing) {
    const missAct = ELEMENT_ACTIVITIES[missing.element];
    parts.push(`【バランス趣味】不足する「${missing.element}」の気を補う趣味として、${missAct.hobby}がおすすめ。メイン趣味と並行して月1〜2回のペースで取り入れると、関係の弱点がじんわり埋まっていきます。`);
  }

  if (t === '食神' || t === '傷官') {
    parts.push(`【通変からの提案】あなたが与える『${t}』の関係なので、料理・お菓子作り・手芸・DIYなど「あなたが作り相手が味わう」系の趣味が特にハマります。相手の素直な喜びがあなたの満足感に直結します。`);
  } else if (t === '印綬' || t === '偏印') {
    parts.push(`【通変からの提案】相手があなたを育てる『${t}』の関係なので、読書会・美術鑑賞・歴史散策など「学ぶ系」が最適。相手が先生役、あなたが生徒役になると自然に学びが深まります。`);
  } else if (t === '正官' || t === '偏官') {
    parts.push(`【通変からの提案】規律系の『${t}』の関係で、武道・ランニング・筋トレ・資格勉強など「達成目標のある」趣味が向きます。お互いを励まし監視する仲間として最強の組み合わせです。`);
  } else if (t === '正財' || t === '偏財') {
    parts.push(`【通変からの提案】あなたが動かす『${t}』の関係で、旅行・グルメ巡り・投資・副業など「行動量が問われる」趣味が◎。あなたが企画し相手が乗る形で、活動範囲が一気に広がります。`);
  } else {
    parts.push(`【通変からの提案】日主が近い『${t}』の関係で、ボードゲーム・音楽セッション・共同制作など「同じ場で一緒に動く」趣味がフィット。テンポが揃うので息の合った連携が楽しめます。`);
  }

  if (hasSangou) {
    parts.push(`【達成系チャレンジ】三合を成す強い縁があるので、フルマラソン完走・副業で月10万円・語学ペラペラなど"長期目標"系に取り組むと想像以上の成果が残ります。結果が形に残る挑戦を選ぶのがおすすめ。`);
  }

  parts.push(`【避けたい組み合わせ】片方だけが熱中し、もう片方は付き合うだけ、という趣味は長期的にモチベーション格差を生みます。温度差を感じたら無理に合わせず、「一緒にやる時間」と「別々で楽しむ時間」を明確に分けるのが賢いやり方です。`);

  return parts.join('\n\n');
}

/** 全観点をまとめた深掘り分析 */
function buildDeepDive(
  self: Meishiki, other: Meishiki,
  bonds: CompatibilityBond[],
  elementCompare: ElementCompareRow[],
  dayStar: DayStarRelation,
  overallScore: number,
  karmaStrength: CompatibilityResult['karmaStrength'],
): CompatibilityDeepDive {
  const daily = buildDailyNarrative(self, other, dayStar);
  const conflict = buildConflictNarrative(bonds);
  const values = buildValuesNarrative(elementCompare);
  const communication = buildCommunicationNarrative(self, other, dayStar);
  const longTerm = buildLongTermNarrative(overallScore, karmaStrength);
  const totalChars = daily.length + conflict.length + values.length + communication.length + longTerm.length;

  const togetherActivities = buildTogetherActivityNarrative(elementCompare, dayStar, bonds);
  const recommendedPlaces = buildRecommendedPlacesNarrative(elementCompare, bonds);
  const livingRelation = buildLivingRelationNarrative(self, other, dayStar, bonds);
  const livingPlace = buildLivingPlaceNarrative(elementCompare, bonds);
  const hobbies = buildHobbyNarrative(elementCompare, dayStar, bonds);
  const practicalTotal = togetherActivities.length + recommendedPlaces.length + livingRelation.length + livingPlace.length + hobbies.length;

  return {
    daily, conflict, values, communication, longTerm, totalChars,
    practical: {
      togetherActivities, recommendedPlaces, livingRelation, livingPlace, hobbies,
      totalChars: practicalTotal,
    },
  };
}

/* ----------------------------------------------------------
 * ── メイン関数 ─────────────────────────────────────────────
 * ---------------------------------------------------------- */
export function analyzeCompatibility(
  self: Meishiki, other: Meishiki,
): CompatibilityResult {
  const bonds = detectBonds(self, other);

  // 位置による重み（日柱が最重要、月・時が次、年が背景）
  const posWeight: Record<PillarPos, number> = { '日': 3, '月': 2, '時': 2, '年': 1 };
  const kindWeight: Record<BondKind, number> = {
    '干合': 3, '三合': 4, '半三合': 2, '六合': 3, '支同': 1,
    '沖': 3, '刑': 2, '害': 1, '破': 1,
  };

  let bondScore = 0;
  let conflictScore = 0;
  for (const b of bonds) {
    const w = kindWeight[b.kind] * ((posWeight[b.selfPos] + posWeight[b.otherPos]) / 2);
    if (b.polarity === '吉') bondScore += w;
    else if (b.polarity === '凶') conflictScore += w;
    else bondScore += w * 0.3;
  }

  // 五行の相互補完スコア（不足を補える場合はプラス）
  const elementCompare = compareElements(self, other);
  let supportScore = 0;
  for (const row of elementCompare) {
    if (row.self < 0.4 && row.other >= 1) supportScore += 2;
    if (row.other < 0.4 && row.self >= 1) supportScore += 2;
  }

  // 相性スコア（0〜100）
  // 吉凶の合計ではなく、比率ベースで計算することで因縁数に過度に依存しないようにする
  const totalWeight = bondScore + conflictScore;
  const positiveRatio = totalWeight > 0 ? bondScore / totalWeight : 0.5;
  const volumeFactor = Math.min(1, totalWeight / 20); // 因縁総量が多いほど結論が強くなる
  const raw = 50 + (positiveRatio - 0.5) * 60 * volumeFactor + supportScore * 2;
  const overallScore = Math.max(15, Math.min(96, Math.round(raw)));

  // 因縁の強さ（総重み、位置も含めた加重を基準にしきい値を設定）
  const karmaPoints = bondScore + conflictScore;
  const karmaStrength: CompatibilityResult['karmaStrength'] =
    karmaPoints >= 40 ? '非常に強い'
      : karmaPoints >= 22 ? '強い'
        : karmaPoints >= 10 ? '普通'
          : '希薄';

  // 日干関係
  const dayStarRelation = computeDayStar(self, other);

  // ── 良い面・気をつける面・異なる面のコメント生成 ──
  const goodPoints: string[] = [];
  const cautionPoints: string[] = [];
  const differentPoints: string[] = [];

  // 良い面: 吉縁＋五行補完
  const goodBonds = bonds.filter((b) => b.polarity === '吉');
  if (goodBonds.some((b) => b.kind === '干合' && (b.selfPos === '日' || b.otherPos === '日'))) {
    goodPoints.push('日柱に干合があり、本質的に惹かれ合う強い縁。長く続くパートナーシップになりやすい。');
  }
  if (goodBonds.some((b) => b.kind === '三合')) {
    goodPoints.push('二人で三合会局を完成させる配置。同じ目標に向かうと想像以上の推進力が生まれる。');
  }
  if (goodBonds.some((b) => b.kind === '半三合' && b.selfPos === '日' && b.otherPos === '日')) {
    goodPoints.push('日柱同士で半三合。生活リズムや価値観が重なり、一緒にいる時間が自然体でいられる。');
  }
  if (goodBonds.some((b) => b.kind === '六合' && b.selfPos === '日' && b.otherPos === '日')) {
    goodPoints.push('日柱の六合。補い合う関係で、相手がいることで自分の足りないピースが埋まる感覚。');
  }
  if (goodBonds.some((b) => b.kind === '支同')) {
    goodPoints.push('同じ地支を共有するため、感覚や空気感が似ていて安心しやすい。');
  }
  for (const row of elementCompare) {
    if (row.self < 0.4 && row.other >= 1) {
      goodPoints.push(`あなたの命式に乏しい「${row.element}」を相手が豊かに持ち、弱点を自然に補ってくれる。`);
    }
    if (row.other < 0.4 && row.self >= 1) {
      goodPoints.push(`相手の命式に乏しい「${row.element}」をあなたが補える。相手から頼られやすい立場。`);
    }
  }
  if (goodPoints.length === 0 && goodBonds.length > 0) {
    goodPoints.push(`${goodBonds.length}箇所の吉縁があり、日常の小さな場面で相性の良さを感じられる。`);
  }
  if (goodPoints.length === 0) {
    goodPoints.push('目立った吉縁は少ないが、五行バランスを意識して付き合えば安定した関係を築ける。');
  }

  // 気をつける面
  const badBonds = bonds.filter((b) => b.polarity === '凶');
  if (badBonds.some((b) => b.kind === '沖' && b.selfPos === '日' && b.otherPos === '日')) {
    cautionPoints.push('日柱同士が沖。強烈に惹かれ合う反面、価値観の衝突や別れの危機も起こりやすい。');
  } else if (badBonds.some((b) => b.kind === '沖')) {
    cautionPoints.push('命式に沖の要素あり。意見の衝突が起きやすいので、冷静になる時間を意識的に取ることが大切。');
  }
  if (badBonds.some((b) => b.kind === '刑')) {
    cautionPoints.push('刑の関係がある。表面は平穏でも内側にストレスをためやすいので、我慢しすぎに注意。');
  }
  if (badBonds.some((b) => b.kind === '害')) {
    cautionPoints.push('害の関係あり。小さな誤解や約束違いが信頼を削るので、丁寧な言語化を心がけて。');
  }
  if (self.dayStem === other.dayStem) {
    cautionPoints.push('日干が同じ（比肩の縁）。似た者同士で心地よい反面、主張がぶつかりやすい。');
  }
  if (cautionPoints.length === 0) {
    cautionPoints.push('大きな凶縁は見当たらない。ただし安定している分、マンネリ化には注意。');
  }

  // 異なる面（五行のギャップ中心）
  const bigDiff = elementCompare
    .filter((r) => Math.abs(r.diff) >= 1.8)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  for (const row of bigDiff.slice(0, 3)) {
    if (row.diff > 0) {
      differentPoints.push(`「${row.element}」はあなたに多く相手に少ない（${fmt(row.self)}対${fmt(row.other)}）。${row.element}が司る領域で感覚差が出やすい。`);
    } else {
      differentPoints.push(`「${row.element}」は相手に多くあなたに少ない（${fmt(row.self)}対${fmt(row.other)}）。相手のペースに合わせすぎない距離感を。`);
    }
  }
  if (differentPoints.length === 0) {
    differentPoints.push('五行バランスが近く、大きな温度差は少ない。似ている分、第三者の視点を入れると新鮮さが保てる。');
  }

  // 総評
  const scoreLabel =
    overallScore >= 80 ? '極上の相性'
      : overallScore >= 65 ? '良い相性'
        : overallScore >= 50 ? '努力で良くなる相性'
          : overallScore >= 35 ? '距離感が鍵の相性'
            : '刺激の強い相性';
  const summary =
    `総合スコア${overallScore}点（${scoreLabel}）。` +
    `因縁の数は${bonds.length}箇所で、結びつきの強さは「${karmaStrength}」です。` +
    `日干関係では、あなたから見て相手は「${dayStarRelation.fromOtherToSelf}」、相手から見てあなたは「${dayStarRelation.fromSelfToOther}」。` +
    (bondScore > conflictScore * 1.5
      ? '吉縁が優勢で、長期的に深まっていく関係性です。'
      : conflictScore > bondScore * 1.2
        ? '刺激的な縁が多く、お互いの課題を浮き彫りにする関係。成長の機会として向き合うと実りがあります。'
        : '吉と凶が拮抗する複雑な縁。丁寧な対話で育てていくことで真価を発揮します。');

  const deepDive = buildDeepDive(
    self, other, bonds, elementCompare, dayStarRelation, overallScore, karmaStrength,
  );

  return {
    bonds,
    bondScore: Math.round(bondScore * 10) / 10,
    conflictScore: Math.round(conflictScore * 10) / 10,
    overallScore,
    karmaStrength,
    elementCompare,
    dayStarRelation,
    goodPoints,
    cautionPoints,
    differentPoints,
    summary,
    deepDive,
  };
}

