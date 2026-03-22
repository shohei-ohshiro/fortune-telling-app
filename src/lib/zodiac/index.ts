export interface ZodiacResult {
  sign: string;
  emoji: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  dateRange: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: string[];
  luckyColor: string;
  luckyNumber: number;
}

const ZODIAC_SIGNS: ZodiacResult[] = [
  {
    sign: '牡羊座', emoji: '♈', element: '火', quality: '活動宮',
    rulingPlanet: '火星', dateRange: '3/21〜4/19',
    title: '情熱の開拓者',
    description: '牡羊座は12星座のトップバッター。何事にも恐れず飛び込む行動力と、周囲を巻き込むエネルギーに満ちています。新しいことへの挑戦が大好きで、リーダーシップを発揮する場面で輝きます。直感的に動くタイプで、考えるより先に行動することも。',
    strengths: ['行動力', 'リーダーシップ', '勇敢さ', '情熱的'],
    weaknesses: ['短気', '飽きっぽい', '衝動的'],
    compatibility: ['獅子座', '射手座', '双子座'],
    luckyColor: '赤', luckyNumber: 9,
  },
  {
    sign: '牡牛座', emoji: '♉', element: '地', quality: '不動宮',
    rulingPlanet: '金星', dateRange: '4/20〜5/20',
    title: '安定を愛する美食家',
    description: '牡牛座は安定と快適さを大切にする星座。五感が鋭く、美しいものや美味しいものに敏感です。一度決めたことはじっくり取り組み、着実に成果を出す粘り強さがあります。信頼できる存在として周囲から頼りにされます。',
    strengths: ['忍耐力', '信頼性', '美的センス', '堅実'],
    weaknesses: ['頑固', '変化を嫌う', '独占欲'],
    compatibility: ['乙女座', '山羊座', '蟹座'],
    luckyColor: '緑', luckyNumber: 6,
  },
  {
    sign: '双子座', emoji: '♊', element: '風', quality: '柔軟宮',
    rulingPlanet: '水星', dateRange: '5/21〜6/21',
    title: '知性のコミュニケーター',
    description: '双子座は知的好奇心が旺盛で、コミュニケーション能力に長けた星座。複数のことを同時にこなすマルチタスクが得意で、新しい情報をキャッチするのが早いです。話題が豊富で、誰とでもすぐに打ち解けることができます。',
    strengths: ['コミュ力', '知的好奇心', '適応力', '機転'],
    weaknesses: ['気分屋', '集中力不足', '優柔不断'],
    compatibility: ['天秤座', '水瓶座', '牡羊座'],
    luckyColor: '黄色', luckyNumber: 5,
  },
  {
    sign: '蟹座', emoji: '♋', element: '水', quality: '活動宮',
    rulingPlanet: '月', dateRange: '6/22〜7/22',
    title: '愛情深い守護者',
    description: '蟹座は家庭や仲間を大切にし、深い愛情で周囲を包み込む星座。直感が鋭く、相手の気持ちを敏感に察知します。面倒見がよく、料理や家事が得意な人も多いです。心を許した人には惜しみなく愛情を注ぎます。',
    strengths: ['包容力', '直感力', '面倒見', '共感力'],
    weaknesses: ['心配性', '感情的', '過保護'],
    compatibility: ['蠍座', '魚座', '牡牛座'],
    luckyColor: '銀', luckyNumber: 2,
  },
  {
    sign: '獅子座', emoji: '♌', element: '火', quality: '不動宮',
    rulingPlanet: '太陽', dateRange: '7/23〜8/22',
    title: '華やかな王者',
    description: '獅子座は生まれながらの主役。自信に満ち、堂々とした振る舞いで周囲を魅了します。創造力が豊かで、自己表現に情熱を注ぎます。面倒見がよく、困っている人を放っておけない正義感の持ち主です。',
    strengths: ['カリスマ性', '創造力', '寛大さ', '自信'],
    weaknesses: ['プライドが高い', '自己中心的', '見栄っ張り'],
    compatibility: ['牡羊座', '射手座', '天秤座'],
    luckyColor: 'ゴールド', luckyNumber: 1,
  },
  {
    sign: '乙女座', emoji: '♍', element: '地', quality: '柔軟宮',
    rulingPlanet: '水星', dateRange: '8/23〜9/22',
    title: '完璧主義の分析家',
    description: '乙女座は細部に目が行き届く観察力の持ち主。分析力に優れ、物事を論理的に整理するのが得意です。健康や生活習慣に気を配り、自分にも他人にも高い基準を持ちます。実務能力が高く、縁の下の力持ちタイプです。',
    strengths: ['分析力', '几帳面', '奉仕精神', '実務力'],
    weaknesses: ['心配性', '批判的', '完璧主義'],
    compatibility: ['牡牛座', '山羊座', '蠍座'],
    luckyColor: 'ネイビー', luckyNumber: 4,
  },
  {
    sign: '天秤座', emoji: '♎', element: '風', quality: '活動宮',
    rulingPlanet: '金星', dateRange: '9/23〜10/23',
    title: '調和を生む外交官',
    description: '天秤座はバランス感覚に優れ、公平さと美しさを愛する星座。社交的で人との関わりの中で輝きます。争いを好まず、常に調和を求めます。美的感覚が鋭く、ファッションやアートに関心が高い人が多いです。',
    strengths: ['社交性', '公平さ', '美的センス', '協調性'],
    weaknesses: ['優柔不断', '八方美人', '依存的'],
    compatibility: ['双子座', '水瓶座', '獅子座'],
    luckyColor: 'ピンク', luckyNumber: 7,
  },
  {
    sign: '蠍座', emoji: '♏', element: '水', quality: '不動宮',
    rulingPlanet: '冥王星', dateRange: '10/24〜11/22',
    title: '深遠なる探求者',
    description: '蠍座は物事の本質を見抜く鋭い洞察力の持ち主。一度決めたことはとことん追求する集中力と、深い感情を内に秘めています。表面的な付き合いよりも、少数の深い関係を好みます。秘密を守る信頼できる存在です。',
    strengths: ['洞察力', '集中力', '忠誠心', '意志力'],
    weaknesses: ['嫉妬深い', '秘密主義', '執着'],
    compatibility: ['蟹座', '魚座', '乙女座'],
    luckyColor: '深紅', luckyNumber: 8,
  },
  {
    sign: '射手座', emoji: '♐', element: '火', quality: '柔軟宮',
    rulingPlanet: '木星', dateRange: '11/23〜12/21',
    title: '自由を愛する冒険家',
    description: '射手座は広い視野と冒険心を持つ楽天家。未知の世界への好奇心が強く、旅行や学問に情熱を注ぎます。率直で裏表がなく、ユーモアのセンスで周囲を楽しませます。束縛を嫌い、自由な生き方を求めます。',
    strengths: ['楽天的', '冒険心', '率直さ', '哲学的'],
    weaknesses: ['無責任', '大雑把', '飽きっぽい'],
    compatibility: ['牡羊座', '獅子座', '水瓶座'],
    luckyColor: '紫', luckyNumber: 3,
  },
  {
    sign: '山羊座', emoji: '♑', element: '地', quality: '活動宮',
    rulingPlanet: '土星', dateRange: '12/22〜1/19',
    title: '野心的な戦略家',
    description: '山羊座は目標に向かって着実に進む忍耐力と計画性の持ち主。社会的な成功を重視し、責任感が強いです。現実的で堅実なアプローチを好み、長期的な視点で物事を考えます。時間と共に存在感を増していくタイプです。',
    strengths: ['忍耐力', '責任感', '計画性', '野心'],
    weaknesses: ['頑固', '悲観的', '仕事中毒'],
    compatibility: ['牡牛座', '乙女座', '魚座'],
    luckyColor: '黒', luckyNumber: 10,
  },
  {
    sign: '水瓶座', emoji: '♒', element: '風', quality: '不動宮',
    rulingPlanet: '天王星', dateRange: '1/20〜2/18',
    title: '革新的な理想主義者',
    description: '水瓶座は独自の視点と革新的なアイデアを持つ星座。常識にとらわれない自由な発想で、新しい可能性を切り開きます。人道的な精神が強く、社会全体の幸福を考えます。個性を大切にし、群れることを好みません。',
    strengths: ['独創性', '人道主義', '知性', '先進的'],
    weaknesses: ['変わり者', '感情表現が苦手', '反抗的'],
    compatibility: ['双子座', '天秤座', '射手座'],
    luckyColor: '水色', luckyNumber: 11,
  },
  {
    sign: '魚座', emoji: '♓', element: '水', quality: '柔軟宮',
    rulingPlanet: '海王星', dateRange: '2/19〜3/20',
    title: '夢見る共感者',
    description: '魚座は12星座の最後に位置し、すべての星座の特性を少しずつ持つと言われます。豊かな感受性と想像力の持ち主で、芸術的な才能に恵まれています。他者の痛みに寄り添える深い共感力を持ちます。',
    strengths: ['共感力', '想像力', '芸術性', '直感力'],
    weaknesses: ['現実逃避', '影響されやすい', '優柔不断'],
    compatibility: ['蟹座', '蠍座', '山羊座'],
    luckyColor: '海の青', luckyNumber: 12,
  },
];

export function calculateZodiac(month: number, day: number): ZodiacResult {
  const index = getZodiacIndex(month, day);
  return ZODIAC_SIGNS[index];
}

function getZodiacIndex(month: number, day: number): number {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 0;  // 牡羊座
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 1;  // 牡牛座
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 2;  // 双子座
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 3;  // 蟹座
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 4;  // 獅子座
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 5;  // 乙女座
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 6; // 天秤座
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 7; // 蠍座
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 8; // 射手座
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 9; // 山羊座
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 10; // 水瓶座
  return 11; // 魚座
}

export const ELEMENT_COLORS: Record<string, string> = {
  '火': '#ef4444',
  '地': '#a3824a',
  '風': '#60a5fa',
  '水': '#2dd4bf',
};
