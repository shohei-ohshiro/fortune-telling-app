/** 数秘術（ライフパスナンバー）の計算と診断 */

export interface NumerologyResult {
  lifePathNumber: number;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: number[]; // 相性の良いナンバー
}

/** 数字を1桁（またはマスターナンバー11,22,33）になるまで足す */
function reduceToSingle(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

/** ライフパスナンバーを計算する */
export function calculateLifePathNumber(year: number, month: number, day: number): number {
  const y = reduceToSingle(year);
  const m = reduceToSingle(month);
  const d = reduceToSingle(day);
  return reduceToSingle(y + m + d);
}

const PROFILES: Record<number, Omit<NumerologyResult, 'lifePathNumber'>> = {
  1: {
    title: 'リーダー・開拓者',
    description: '独立心が強く、自分の道を切り開く力を持っています。創造力と決断力に優れ、新しいことを始めるのが得意です。周囲を率いるリーダーとしての資質があり、困難な状況でも前に進む勇気があります。',
    strengths: ['リーダーシップ', '独立心', '創造力', '決断力'],
    weaknesses: ['頑固', '自己中心的', '孤独になりがち'],
    compatibility: [3, 5, 7],
  },
  2: {
    title: '調和・協力者',
    description: '繊細で思いやりがあり、人と人をつなぐ架け橋のような存在です。直感力に優れ、相手の気持ちを察する能力が高いです。平和を愛し、協力することで最大の力を発揮します。',
    strengths: ['協調性', '直感力', '思いやり', '外交力'],
    weaknesses: ['優柔不断', '依存的', '感情的'],
    compatibility: [4, 6, 8],
  },
  3: {
    title: '表現者・クリエイター',
    description: '明るく社交的で、自己表現の才能に恵まれています。楽観的な性格で周囲を楽しませる力があります。芸術やコミュニケーションの分野で輝く可能性を秘めています。',
    strengths: ['表現力', '社交性', '楽観性', '創造性'],
    weaknesses: ['散漫', '感情の浮き沈み', '現実逃避'],
    compatibility: [1, 5, 9],
  },
  4: {
    title: '建設者・安定の人',
    description: '堅実で努力家、物事を着実に積み上げていく力があります。秩序と安定を重んじ、計画的に行動します。信頼性が高く、周囲から頼られる存在です。',
    strengths: ['堅実さ', '計画性', '忍耐力', '信頼性'],
    weaknesses: ['柔軟性不足', '保守的', '仕事中毒'],
    compatibility: [2, 6, 8],
  },
  5: {
    title: '自由人・冒険家',
    description: '変化と自由を愛し、好奇心旺盛な冒険家タイプです。多才で適応力が高く、新しい経験を求めて常に動き続けます。多くの人を惹きつける魅力があります。',
    strengths: ['適応力', '好奇心', '多才', '魅力'],
    weaknesses: ['落ち着きがない', '飽きっぽい', '無責任'],
    compatibility: [1, 3, 7],
  },
  6: {
    title: '奉仕者・愛の人',
    description: '責任感が強く、家族や周囲の人を大切にする愛情深い人です。調和と美を追求し、人の役に立つことに喜びを感じます。教育や癒しの分野で力を発揮します。',
    strengths: ['責任感', '愛情深さ', '調和', '奉仕精神'],
    weaknesses: ['過干渉', '自己犠牲', '完璧主義'],
    compatibility: [2, 4, 9],
  },
  7: {
    title: '探求者・哲学者',
    description: '知的好奇心が強く、物事の本質を探求する深い思考力があります。精神的な成長を求め、独自の世界観を持っています。分析力と洞察力に優れた知恵者です。',
    strengths: ['分析力', '洞察力', '知性', '精神性'],
    weaknesses: ['孤立しがち', '懐疑的', '内向的すぎる'],
    compatibility: [1, 5, 9],
  },
  8: {
    title: '実業家・成功者',
    description: 'ビジネスセンスに優れ、物質的な成功を引き寄せる力があります。組織力とマネジメント能力が高く、大きな目標に向かって突き進みます。権威と影響力を持つリーダーです。',
    strengths: ['ビジネスセンス', '組織力', '決断力', '実行力'],
    weaknesses: ['強引', '物質主義', 'ワーカホリック'],
    compatibility: [2, 4, 6],
  },
  9: {
    title: '博愛主義者・賢者',
    description: '広い視野と深い理解力を持ち、人類全体の幸福を願う博愛精神の持ち主です。芸術的才能と精神的な深さを兼ね備え、多くの人に影響を与える存在です。',
    strengths: ['博愛精神', '芸術性', '理解力', 'カリスマ性'],
    weaknesses: ['理想主義', '感情的', '犠牲的'],
    compatibility: [3, 6, 7],
  },
  11: {
    title: 'マスターナンバー・直感の人',
    description: '非常に強い直感力とスピリチュアルな感性を持つ特別な存在です。高い理想と深い洞察力で人々を導きます。繊細さゆえに傷つきやすい面もありますが、大きな可能性を秘めています。',
    strengths: ['直感力', 'インスピレーション', '理想主義', '霊的感性'],
    weaknesses: ['神経過敏', 'プレッシャーに弱い', '現実離れ'],
    compatibility: [2, 4, 6],
  },
  22: {
    title: 'マスターナンバー・建設の達人',
    description: '大きなビジョンを現実の形にする稀有な能力を持っています。実務力とスピリチュアルな感性の両方を兼ね備え、壮大なプロジェクトを成功に導くマスタービルダーです。',
    strengths: ['ビジョン', '実務力', '影響力', '大局観'],
    weaknesses: ['プレッシャー', '高すぎる期待', '自己批判'],
    compatibility: [4, 6, 8],
  },
  33: {
    title: 'マスターナンバー・至高の愛',
    description: '無条件の愛と奉仕の精神を持つ、最も高い波動のマスターナンバーです。人々を癒し導く使命を持ち、その存在自体が周囲に光をもたらします。',
    strengths: ['無条件の愛', '癒しの力', '奉仕', '精神的指導'],
    weaknesses: ['自己犠牲', '現実とのギャップ', '疲弊しやすい'],
    compatibility: [6, 9, 11],
  },
};

/** 数秘術の診断結果を取得する */
export function getNumerologyResult(year: number, month: number, day: number): NumerologyResult {
  const lifePathNumber = calculateLifePathNumber(year, month, day);
  const profile = PROFILES[lifePathNumber] || PROFILES[reduceToSingle(lifePathNumber)];
  return { lifePathNumber, ...profile };
}
