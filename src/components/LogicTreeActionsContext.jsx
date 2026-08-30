import { createContext } from 'react'

// LogicTreeNode（各ノード）から、ノードの追加・編集・削除をLogicTree側に伝えるための仕組み
const LogicTreeActionsContext = createContext({
  addChild: () => {},
  updateContent: () => {},
  deleteNode: () => {},
  getHint: () => {},
  hintLoadingNodeId: null,
})

export default LogicTreeActionsContext
