import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'
import { parseJsonBlock } from '../_shared/parseJsonBlock.ts'
import { truncate } from '../_shared/truncate.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const FEEDBACK_TOTAL_MAX_LENGTH = 500 // 良かった点+改善点+深掘り理由の合計文字数の上限

interface TreeNode {
  id: string
  parentId: string | null
  title?: string
  content: string
}

function nodeLabel(node: TreeNode) {
  const content = node.content || '(未入力)'
  return node.title ? `${node.title}：${content}` : content
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
      lines.push(`${'  '.repeat(depth)}- ${nodeLabel(node)}`)
      walk(node.id, depth + 1)
    }
  }
  walk(null, 0)
  return lines.join('\n')
}

const SYSTEM_PROMPT = `あなたはロジックツリー作成トレーニングを指導するコーチです。
ユーザーが作成したロジックツリーを、次の7項目についてそれぞれ100点満点で評価してください。
ツリーの各ノードは「要素：説明」の形で渡されます(ルートは説明のみ)。

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
- goodPoints・improvements・deepenNodesのreasonを全部合わせた文字数が、
  500文字以内になるようにしてください。
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

    // AIが文字数制限を守らなかった場合の保険として、合計500文字に収まるよう
    // goodPoints -> improvements -> deepenNodesの順に、残り文字数ぶんだけ使う
    let remaining = FEEDBACK_TOTAL_MAX_LENGTH
    const takeWithinBudget = (text: string) => {
      if (remaining <= 0) return ''
      const piece = truncate(text, remaining)
      remaining -= piece.length
      return piece
    }

    evaluation.goodPoints = (evaluation.goodPoints ?? [])
      .map(takeWithinBudget)
      .filter((t: string) => t.length > 0)
    evaluation.improvements = (evaluation.improvements ?? [])
      .map(takeWithinBudget)
      .filter((t: string) => t.length > 0)
    evaluation.deepenNodes = (evaluation.deepenNodes ?? [])
      .map((n: { content: string; reason: string }) => ({
        ...n,
        reason: takeWithinBudget(n.reason ?? ''),
      }))
      .filter((n: { reason: string }) => n.reason.length > 0)

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
