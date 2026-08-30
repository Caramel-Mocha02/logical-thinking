import { useContext, useState } from 'react'
import { Handle, Position, useNodeId } from '@xyflow/react'
import { Paper, TextField, Typography, IconButton, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LogicTreeActionsContext from './LogicTreeActionsContext.jsx'

const MAX_LENGTH = 100

function LogicTreeNode({ data }) {
  const nodeId = useNodeId()
  const { addChild, updateContent, deleteNode } = useContext(LogicTreeActionsContext)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)

  const startEditing = () => {
    setDraft(data.label)
    setEditing(true)
  }

  const commit = () => {
    updateContent(nodeId, draft.trim())
    setEditing(false)
  }

  return (
    <Paper variant="outlined" sx={{ minWidth: 220, maxWidth: 260, p: 1.5, borderRadius: 2 }}>
      <Handle type="target" position={Position.Top} />

      {editing ? (
        <TextField
          className="nodrag"
          autoFocus
          fullWidth
          multiline
          maxRows={4}
          size="small"
          value={draft}
          helperText={`${draft.length}/${MAX_LENGTH}`}
          slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commit()
            }
          }}
        />
      ) : (
        <Typography
          className="nodrag"
          variant="body2"
          onClick={startEditing}
          sx={{
            minHeight: 40,
            whiteSpace: 'pre-wrap',
            cursor: 'text',
            color: data.label ? 'text.primary' : 'text.disabled',
          }}
        >
          {data.label || 'クリックして入力'}
        </Typography>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: 'flex-end' }}>
        <IconButton
          className="nodrag"
          size="small"
          onClick={() => addChild(nodeId)}
          title="子ノードを追加"
        >
          <AddIcon fontSize="small" />
        </IconButton>
        {!data.isRoot && (
          <IconButton
            className="nodrag"
            size="small"
            onClick={() => deleteNode(nodeId)}
            title="このノードを削除"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Handle type="source" position={Position.Bottom} />
    </Paper>
  )
}

export default LogicTreeNode
