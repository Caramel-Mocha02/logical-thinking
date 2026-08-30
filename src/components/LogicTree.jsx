import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ノード追加・編集はPhase 5で実装する。今はルートノードだけを表示する
const initialNodes = [
  {
    id: 'root',
    position: { x: 300, y: 150 },
    data: { label: 'ここに考えを入力' },
  },
]

function LogicTree() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={initialNodes} edges={[]} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default LogicTree
