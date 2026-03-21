/** 動物占い（12種類の動物キャラクター） */

export interface AnimalResult {
  animal: string;
  emoji: string;
  color: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: string[]; // 相性の良い動物
}

const ANIMALS: AnimalResult[] = [
  {
    animal: 'オオカミ',
    emoji: '🐺',
    color: 'from-gray-600 to-gray-800',
    title: '一匹狼の実力者',
    description: '独自の世界観を持ち、群れに属さず自分の力で道を切り開くタイプ。こだわりが強く、妥協を許さない完璧主義者。信頼した相手には深い愛情を注ぎます。',
    strengths: ['独立心', 'こだわり', '集中力', '誠実'],
    weaknesses: ['協調性不足', '頑固', '不器用'],
    compatibility: ['コアラ', 'ゾウ', 'ペガサス'],
  },
  {
    animal: 'コアラ',
    emoji: '🐨',
    color: 'from-amber-600 to-amber-800',
    title: '癒しのマイペース',
    description: 'おっとりしていて周囲を癒す存在。マイペースに見えて実は計算高い一面も。好きなことにはとことんハマる情熱家です。',
    strengths: ['癒し力', 'マイペース', '情熱', '直感力'],
    weaknesses: ['怠惰', '依存的', '優柔不断'],
    compatibility: ['オオカミ', 'タヌキ', 'コジカ'],
  },
  {
    animal: 'サル',
    emoji: '🐵',
    color: 'from-orange-500 to-orange-700',
    title: '器用な社交家',
    description: '頭の回転が速く、どんな状況にも素早く適応できる器用さが魅力。ユーモアのセンスがあり、場を盛り上げるムードメーカーです。',
    strengths: ['器用さ', '社交性', '機転', 'ユーモア'],
    weaknesses: ['飽きっぽい', '落ち着きがない', '浅く広く'],
    compatibility: ['クロヒョウ', 'トラ', 'ゾウ'],
  },
  {
    animal: 'チーター',
    emoji: '🐆',
    color: 'from-yellow-500 to-yellow-700',
    title: 'スピードの天才',
    description: '瞬発力と行動力が抜群。思い立ったらすぐ行動する即断即決タイプ。目標に向かって一直線に突き進む集中力があります。',
    strengths: ['行動力', '瞬発力', '集中力', '目標達成力'],
    weaknesses: ['短気', '持続力不足', 'せっかち'],
    compatibility: ['ライオン', 'ペガサス', 'ヒツジ'],
  },
  {
    animal: 'クロヒョウ',
    emoji: '🐈‍⬛',
    color: 'from-slate-700 to-slate-900',
    title: 'ミステリアスな情熱家',
    description: 'クールな外見とは裏腹に、内面には熱い情熱を秘めています。直感力が鋭く、本質を見抜く力があります。美意識が高くセンス抜群。',
    strengths: ['直感力', '美意識', '情熱', 'センス'],
    weaknesses: ['気分屋', '秘密主義', '嫉妬深い'],
    compatibility: ['サル', 'コジカ', 'タヌキ'],
  },
  {
    animal: 'ライオン',
    emoji: '🦁',
    color: 'from-amber-500 to-red-700',
    title: '堂々たるリーダー',
    description: '生まれながらのリーダー気質。堂々とした存在感で周囲を圧倒します。面倒見がよく、弱い者を守る正義感があります。',
    strengths: ['リーダーシップ', '存在感', '正義感', '面倒見'],
    weaknesses: ['プライドが高い', '支配的', '見栄っ張り'],
    compatibility: ['チーター', 'ゾウ', 'ヒツジ'],
  },
  {
    animal: 'トラ',
    emoji: '🐯',
    color: 'from-orange-600 to-red-800',
    title: '義理堅い親分肌',
    description: '義理と人情に厚く、困っている人を放っておけない親分肌。一度信頼した相手にはどこまでも尽くす、情に厚い人です。',
    strengths: ['義理堅さ', '行動力', '面倒見', '信念'],
    weaknesses: ['おせっかい', '短気', '大雑把'],
    compatibility: ['サル', 'コジカ', 'タヌキ'],
  },
  {
    animal: 'タヌキ',
    emoji: '🦝',
    color: 'from-emerald-600 to-emerald-800',
    title: '世渡り上手の人気者',
    description: '愛嬌があり、誰からも好かれる天性の人たらし。場の空気を読む能力に長け、バランス感覚に優れています。実は計算高い一面も。',
    strengths: ['社交性', '愛嬌', 'バランス感覚', '適応力'],
    weaknesses: ['八方美人', '本音が見えない', '優柔不断'],
    compatibility: ['コアラ', 'クロヒョウ', 'トラ'],
  },
  {
    animal: 'コジカ',
    emoji: '🦌',
    color: 'from-pink-500 to-pink-700',
    title: '純真な甘え上手',
    description: '純真で素直、周囲に愛される可愛らしい存在。甘え上手で人の懐に入るのが得意。繊細な感性を持ち、芸術的才能があります。',
    strengths: ['純真さ', '感性', '愛嬌', '芸術性'],
    weaknesses: ['甘え', '依存的', '傷つきやすい'],
    compatibility: ['コアラ', 'クロヒョウ', 'トラ'],
  },
  {
    animal: 'ゾウ',
    emoji: '🐘',
    color: 'from-blue-600 to-blue-800',
    title: '頼れる大器晩成型',
    description: '温厚で忍耐力があり、じっくりと物事に取り組む大器晩成型。一度決めたことは最後までやり遂げる粘り強さがあります。',
    strengths: ['忍耐力', '誠実さ', '安定感', '粘り強さ'],
    weaknesses: ['変化に弱い', '鈍感', '頑固'],
    compatibility: ['オオカミ', 'サル', 'ライオン'],
  },
  {
    animal: 'ヒツジ',
    emoji: '🐑',
    color: 'from-sky-400 to-sky-600',
    title: '穏やかな平和主義者',
    description: '穏やかで優しく、争いを好まない平和主義者。グループの中で調和を保つ役割を自然と担います。寂しがり屋で、仲間を大切にします。',
    strengths: ['優しさ', '協調性', '思いやり', '穏やかさ'],
    weaknesses: ['寂しがり', '流されやすい', '自己主張が苦手'],
    compatibility: ['チーター', 'ライオン', 'ペガサス'],
  },
  {
    animal: 'ペガサス',
    emoji: '🦄',
    color: 'from-violet-500 to-violet-700',
    title: '天才肌の自由人',
    description: '既成概念にとらわれない自由な発想と天性のセンスを持つ天才肌。束縛を嫌い、自分だけの世界を持っています。気まぐれだが魅力的。',
    strengths: ['独創性', '自由な発想', 'センス', '魅力'],
    weaknesses: ['気まぐれ', '協調性不足', '飽きっぽい'],
    compatibility: ['オオカミ', 'チーター', 'ヒツジ'],
  },
];

/**
 * 生年月日から動物を算出する
 * 簡易版: 生年月日の数字の合計を12で割った余りで決定
 */
export function calculateAnimal(year: number, month: number, day: number): AnimalResult {
  // 各桁の数字の合計
  const digits = `${year}${month}${day}`.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  const index = sum % 12;
  return ANIMALS[index];
}

export { ANIMALS };
