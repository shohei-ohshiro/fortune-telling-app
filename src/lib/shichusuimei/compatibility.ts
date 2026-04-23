import {
  ELEMENT_CYCLE,
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
  return (ELEMENT_CYCLE as Element[]).map((el) => {
    const a = self.elements[el];
    const b = other.elements[el];
    const diff = a - b;
    let comment: string;
    if (a === 0 && b > 0) {
      comment = `あなたに不足する${el}を相手が補える`;
    } else if (b === 0 && a > 0) {
      comment = `相手に不足する${el}をあなたが補える`;
    } else if (Math.abs(diff) >= 3) {
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
    if (row.self === 0 && row.other > 0) supportScore += 2;
    if (row.other === 0 && row.self > 0) supportScore += 2;
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
    if (row.self === 0 && row.other > 0) {
      goodPoints.push(`あなたの命式に無い「${row.element}」を相手が豊かに持ち、弱点を自然に補ってくれる。`);
    }
    if (row.other === 0 && row.self > 0) {
      goodPoints.push(`相手の命式に無い「${row.element}」をあなたが補える。相手から頼られやすい立場。`);
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
    .filter((r) => Math.abs(r.diff) >= 2)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  for (const row of bigDiff.slice(0, 3)) {
    if (row.diff > 0) {
      differentPoints.push(`「${row.element}」はあなたに多く相手に少ない（${row.self}対${row.other}）。${row.element}が司る領域で感覚差が出やすい。`);
    } else {
      differentPoints.push(`「${row.element}」は相手に多くあなたに少ない（${row.self}対${row.other}）。相手のペースに合わせすぎない距離感を。`);
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
  };
}

