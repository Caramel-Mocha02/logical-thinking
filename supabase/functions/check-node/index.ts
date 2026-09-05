import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'
import { parseJsonBlock } from '../_shared/parseJsonBlock.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const CHECK_NODE_SYSTEM_PROMPT = `あなたはロジックツリー作成トレーニングを指導するコーチです。
ユーザーが指定した1つのノードについて、次の4項目をそれぞれ100点満点で評価してください。

- abstraction(抽象度: 親ノードと比べて粒度が揃っているか)
- concreteness(具体性: 実行者がそのまま動けるくらい具体的に書かれているか)
- causality(因果関係: 親ノードとの間に論理の飛躍がないか)
- parentRelation(親ノードとの関係: 親ノードを分解した要素として適切か)

重要なルール:
- ユーザーの代わりに答えを完成させないでください。フィードバックでは、
  具体的な答えそのものを書かず、「どの観点で」「なぜ」見直すとよいかだけを示してください。
- 出力は、説明文を付けず、次のJSON形式のみを返してください。

{
  "scores": {
    "abstraction": 0から100の整数,
    "concreteness": 0から100の整数,
    "causality": 0から100の整数,
    "parentRelation": 0から100の整数
  },
  "feedback": "2〜4文程度のフィードバック"
}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionType, questionText, path } = await req.json()

    if (!questionText || !Array.isArray(path) || path.length < 2) {
      return new Response(
        JSON.stringify({ error: 'questionTextと、親を含むpath(2件以上)が必要です' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const targetContent = path[path.length - 1] || '(未入力)'
    const parentContent = path[path.length - 2] || '(未入力)'

    const userPrompt = `お題(${questionType}型): ${questionText}

ルートから対象ノードまでの流れ:
${path.map((c: string) => c || '(未入力)').join(' → ')}

評価対象ノード: 「${targetContent}」
親ノード: 「${parentContent}」`

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1000,
      system: CHECK_NODE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const result = parseJsonBlock(textBlock!.text)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'チェックに失敗しました' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
