import {Path, SchemaType} from '@sanity/types'
import React, {memo, useCallback, useEffect, useRef, useState} from 'react'
import {DocumentFieldAction, DocumentFieldActionNode} from '../../config'
import {useUnique} from '../../util'

/** @internal */
export interface FieldActionsProps {
  actions: DocumentFieldAction[]
  documentId: string
  documentType: string
  onActions: (actions: DocumentFieldActionNode[]) => void
  path: Path
  schemaType: SchemaType
}

/** @internal */
export const FieldActions = memo(function FieldActions(props: FieldActionsProps) {
  const {actions, documentId, documentType, onActions, path, schemaType} = props

  const len = actions.length
  const lenRef = useRef(len)

  const [fieldActions, setFieldActions] = useState<DocumentFieldActionNode[]>(() =>
    Array.from(new Array(len))
  )

  const fieldActionsRef = useRef(fieldActions)

  useEffect(() => {
    fieldActionsRef.current = fieldActions
  }, [fieldActions])

  useEffect(() => {
    if (lenRef.current !== len) {
      const newFieldActions = Array.from(new Array(len))

      for (let i = 0; i < len; i++) {
        newFieldActions[i] = fieldActionsRef.current[i]
      }

      lenRef.current = len

      setFieldActions(newFieldActions)
      fieldActionsRef.current = newFieldActions
    }
  }, [len])

  const setFieldAction = useCallback((index: number, node: DocumentFieldActionNode) => {
    setFieldActions((prev) => {
      const next = [...prev]
      next[index] = node
      return next
    })
  }, [])

  useEffect(() => {
    onActions(fieldActions.filter(Boolean))
  }, [fieldActions, onActions])

  return (
    <>
      {actions.map((a, aIdx) => (
        <FieldAction
          action={a}
          index={aIdx}
          // eslint-disable-next-line react/no-array-index-key
          key={aIdx}
          documentId={documentId}
          documentType={documentType}
          path={path}
          schemaType={schemaType}
          setFieldAction={setFieldAction}
        />
      ))}
    </>
  )
})

interface FieldActionProps {
  action: DocumentFieldAction
  documentId: string
  documentType: string
  index: number
  path: Path
  schemaType: SchemaType
  setFieldAction: (index: number, node: DocumentFieldActionNode) => void
}

const FieldAction = memo(function FieldAction(props: FieldActionProps) {
  const {action, documentId, documentType, index, path, schemaType, setFieldAction} = props

  const node = useUnique(
    action.useAction({
      documentId,
      documentType,
      path,
      schemaType,
    })
  )

  useEffect(() => {
    setFieldAction(index, node)
  }, [index, node, setFieldAction])

  return <></>
})
