import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'
import { parseJsonBlock } from '../_shared/parseJsonBlock.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

interface TreeNode {
  id: string
  parentId: string | null
  content: string
}

// nodes(親子関係を含むフラットな配列)から、階層をインデントしたテキストに変換する
function buildTreeText(nodes: TreeNode[]) {
  const childrenByParent = new Map<string | null, TreeNode[]>()
  for (const node of nodes) {
    const key = node.parentId ?? null
    if (!childrenByParent.has(key)) childrenByParent.set(key, [])
    childrenByParent.get(key)!.push(node)
  }

  const lines: string[] = []
  function walk(parentId: string | null, depth: number) {
    for (const node of childrenByParent.get(parentId) ?? []) {
      lines.push(`${'  '.repeat(depth)}- ${node.content || '(未入力)'}`)
      walk(node.id, depth + 1)
    }
  }
  walk(null, 0)
  return lines.join('\n')
}

const SYSTEM_PROMPT = `あなたはロジックツリー作成トレーニングを指導するコーチです。
ユーザーが作成したロジックツリーを、次の7項目についてそれぞれ100点満点で評価してください。

- logic(論理性)
- mece(MECE)
- hierarchy(階層構造)
- abstraction(抽象度)
- causality(因果関係)
- concreteness(具体性)
- expression(文章表現)

重要なルール:
- ユーザーの代わりに答えを完成させないでください。改善点や深掘りすべき点を指摘するときは、
  具体的な答えそのものを書かず、「どの観点で」「なぜ」考え直すとよいかだけを示してください。
- 出力は、説明文を付けず、次のJSON形式のみを返してください。

{
  "scores": {
    "logic": 0から100の整数,
    "mece": 0から100の整数,
    "hierarchy": 0から100の整数,
    "abstraction": 0から100の整数,
    "causality": 0から100の整数,
    "concreteness": 0から100の整数,
    "expression": 0から100の整数
  },
  "total": 0から100の整数(7項目を踏まえた総合点),
  "goodPoints": ["良かった点を1〜3個、文章で"],
  "improvements": ["改善した方がよい点を1〜3個、文章で"],
  "deepenNodes": [{"content": "対象ノードの文章", "reason": "なぜもう一段深掘りすべきか"}]
}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionType, questionText, nodes } = await req.json()

    if (!questionText || !Array.isArray(nodes)) {
      return new Response(JSON.stringify({ error: 'questionTextとnodesが必要です' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userPrompt = `お題(${questionType}型): ${questionText}

ロジックツリー:
${buildTreeText(nodes) || '(ノードがありません)'}`

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const evaluation = parseJsonBlock(textBlock!.text)

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: '評価に失敗しました' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
