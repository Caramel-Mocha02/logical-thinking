import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Phase 3: React Flowが正しく動くかを確認するためのサンプルノード
// 実際のロジックツリーの表示はPhase 4で作る
const sampleNodes = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: { label: 'ロジックツリー（サンプル）' },
  },
]

function LogicTree() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={sampleNodes} edges={[]} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default LogicTree
