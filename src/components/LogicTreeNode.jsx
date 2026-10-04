import { useContext, useState } from 'react'
import { Handle, Position, useNodeId } from '@xyflow/react'
import { Box, Paper, TextField, Typography, IconButton, Stack, CircularProgress } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import LogicTreeActionsContext from './LogicTreeActionsContext.jsx'

const TITLE_MAX_LENGTH = 20
const CONTENT_MAX_LENGTH = 100

function LogicTreeNode({ data }) {
  const nodeId = useNodeId()
  const {
    addChild,
    updateNode,
    deleteNode,
    getHint,
    hintLoadingNodeId,
    hintRemaining,
    checkNode,
    checkingNodeId,
    orientation,
  } = useContext(LogicTreeActionsContext)
  const targetPosition = orientation === 'vertical' ? Position.Top : Position.Left
  const sourcePosition = orientation === 'vertical' ? Position.Bottom : Position.Right
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(data.title ?? '')
  const [draftContent, setDraftContent] = useState(data.content ?? '')

  const startEditing = () => {
    setDraftTitle(data.title ?? '')
    setDraftContent(data.content ?? '')
    setEditing(true)
  }

  const commit = () => {
    updateNode(nodeId, { title: draftTitle.trim(), content: draftContent.trim() })
    setEditing(false)
  }

  const isEmpty = !data.title && !data.content

  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 220,
        maxWidth: 260,
        p: 1.5,
        borderRadius: 2,
        ...(data.isRoot && {
          borderColor: 'primary.main',
          borderWidth: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
        }),
      }}
    >
      <Handle type="target" position={targetPosition} />

      {data.isRoot && (
        <Typography variant="overline" color="primary" sx={{ display: 'block', lineHeight: 1 }}>
          ゴール
        </Typography>
      )}

      {editing ? (
        data.isRoot ? (
          <TextField
            className="nodrag"
            autoFocus
            fullWidth
            multiline
            maxRows={4}
            size="small"
            value={draftContent}
            helperText={`${draftContent.length}/${CONTENT_MAX_LENGTH}`}
            slotProps={{ htmlInput: { maxLength: CONTENT_MAX_LENGTH } }}
            onChange={(e) => setDraftContent(e.target.value)}
            onBlur={commit}
          />
        ) : (
          <Stack spacing={1}>
            <TextField
              className="nodrag"
              autoFocus
              fullWidth
              size="small"
              label="要素"
              value={draftTitle}
              helperText={`${draftTitle.length}/${TITLE_MAX_LENGTH}`}
              slotProps={{ htmlInput: { maxLength: TITLE_MAX_LENGTH } }}
              onChange={(e) => setDraftTitle(e.target.value)}
            />
            <TextField
              className="nodrag"
              fullWidth
              multiline
              maxRows={4}
              size="small"
              label="説明"
              value={draftContent}
              helperText={`${draftContent.length}/${CONTENT_MAX_LENGTH}`}
              slotProps={{ htmlInput: { maxLength: CONTENT_MAX_LENGTH } }}
              onChange={(e) => setDraftContent(e.target.value)}
              onBlur={commit}
            />
          </Stack>
        )
      ) : (
        <Box className="nodrag" onClick={startEditing} sx={{ minHeight: 40, cursor: 'text' }}>
          {data.isRoot ? (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                color: data.content ? 'text.primary' : 'text.disabled',
              }}
            >
              {data.content || 'クリックして入力'}
            </Typography>
          ) : isEmpty ? (
            <Typography variant="body2" color="text.disabled">
              クリックして入力
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {data.title || '(要素未入力)'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
              >
                {data.content}
              </Typography>
            </>
          )}
        </Box>
      )}

      {!data.isRoot && !editing && (
        <Typography variant="caption" color="text.disabled">
          要素{data.title.length}/{TITLE_MAX_LENGTH}文字・説明{data.content.length}/
          {CONTENT_MAX_LENGTH}文字
        </Typography>
      )}

      <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: 'flex-end' }}>
        <IconButton
          className="nodrag"
          size="small"
          onClick={() => getHint(nodeId)}
          disabled={hintLoadingNodeId !== null || hintRemaining <= 0}
          title={`ヒントをもらう（残り${hintRemaining}回）`}
        >
          {hintLoadingNodeId === nodeId ? (
            <CircularProgress size={16} />
          ) : (
            <LightbulbIcon fontSize="small" />
          )}
        </IconButton>
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
            onClick={() => checkNode(nodeId)}
            disabled={checkingNodeId !== null}
            title="このノードをチェック"
          >
            {checkingNodeId === nodeId ? (
              <CircularProgress size={16} />
            ) : (
              <FactCheckIcon fontSize="small" />
            )}
          </IconButton>
        )}
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

      <Handle type="source" position={sourcePosition} />
    </Paper>
  )
}

export default LogicTreeNode
