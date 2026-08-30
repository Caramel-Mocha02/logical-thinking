import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic() // ANTHROPIC_API_KEYは環境変数から自動で読み込まれる

const app = express()
app.use(cors())
app.use(express.json())

// nodes(親子関係を含むフラットな配列)から、階層をインデントしたテキストに変換する
function buildTreeText(nodes) {
  const childrenByParent = new Map()
  for (const node of nodes) {
    const key = node.parentId ?? null
    if (!childrenByParent.has(key)) childrenByParent.set(key, [])
    childrenByParent.get(key).push(node)
  }

  const lines = []
  function walk(parentId, depth) {
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

function parseEvaluationJson(text) {
  // Claudeがコードフェンス付きで返してきた場合に備えて取り除く
  const cleaned = text.replace(/^```json\s*|```$/g, '').trim()
  return JSON.parse(cleaned)
}

app.post('/api/evaluate', async (req, res) => {
  const { questionType, questionText, nodes } = req.body

  if (!questionText || !Array.isArray(nodes)) {
    res.status(400).json({ error: 'questionTextとnodesが必要です' })
    return
  }

  const userPrompt = `お題(${questionType}型): ${questionText}

ロジックツリー:
${buildTreeText(nodes) || '(ノードがありません)'}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const evaluation = parseEvaluationJson(textBlock.text)
    res.json(evaluation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '評価に失敗しました' })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`server listening on port ${port}`))
