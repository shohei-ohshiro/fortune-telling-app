import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meishiki, numerology, animal, birthDate } = body;

    if (!meishiki || !numerology || !animal) {
      return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
    }

    const prompt = `あなたは四柱推命、数秘術、動物占いに精通した占い師です。
以下の鑑定結果をもとに、この人だけの総合鑑定文を800文字程度で作成してください。

【生年月日】${birthDate}

【四柱推命】
- 日主（日干）: ${meishiki.dayStem}
- 性格タイプ: ${meishiki.personalityTitle}
- 強み: ${meishiki.strengths}
- 弱み: ${meishiki.weaknesses}
- 五行バランス: 木${meishiki.elements.木} 火${meishiki.elements.火} 土${meishiki.elements.土} 金${meishiki.elements.金} 水${meishiki.elements.水}

【数秘術】
- ライフパスナンバー: ${numerology.lifePathNumber}
- タイプ: ${numerology.title}

【動物占い】
- 動物: ${animal.animal}
- タイプ: ${animal.title}

以下の構成で鑑定文を書いてください：
1. 総合的な性格分析（3つの占術を統合した見解）
2. 天職・適職のアドバイス
3. 恋愛・人間関係の傾向
4. 今後の人生で意識すべきこと

温かみがありつつも具体的で、読んだ人が「自分のことだ」と感じるような文章にしてください。`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const content = message.content[0];
    const text = content.type === 'text' ? content.text : '';

    return NextResponse.json({ reading: text });
  } catch (error: unknown) {
    console.error('AI reading error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `AI鑑定の生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
