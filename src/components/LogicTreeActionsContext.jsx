import { createContext } from 'react'

// LogicTreeNode（各ノード）から、ノードの追加・編集・削除をLogicTree側に伝えるための仕組み
const LogicTreeActionsContext = createContext({
  addChild: () => {},
  updateNode: () => {},
  deleteNode: () => {},
  getHint: () => {},
  hintLoadingNodeId: null,
  hintRemaining: 0,
  checkNode: () => {},
  checkingNodeId: null,
  orientation: 'vertical',
  locked: false,
})

export default LogicTreeActionsContext
