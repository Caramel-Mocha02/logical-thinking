import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const HINT_SYSTEM_PROMPT = `あなたはロジックツリー作成トレーニングを指導するコーチです。
ユーザーが今取り組んでいるノードについて、次にどう考えを深めればよいか、
方向性のヒントだけを2〜3文程度で示してください。

重要なルール:
- 具体的な答えそのもの(実際の打ち手や分解結果)を書いてはいけません。
- 「〜という観点から考えてみましょう」のように、視点や切り口だけを提示してください。
- 出力は、説明文や見出しを付けず、ヒントの本文だけを返してください。`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionType, questionText, path } = await req.json()

    if (!questionText || !Array.isArray(path) || path.length === 0) {
      return new Response(JSON.stringify({ error: 'questionTextとpathが必要です' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const targetContent = path[path.length - 1] || '(未入力)'
    const userPrompt = `お題(${questionType}型): ${questionText}

ルートから対象ノードまでの流れ:
${path.map((c: string) => c || '(未入力)').join(' → ')}

一番下の「${targetContent}」というノードについて、ヒントをください。`

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 500,
      system: HINT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')

    return new Response(JSON.stringify({ hint: textBlock!.text.trim() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'ヒントの取得に失敗しました' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
