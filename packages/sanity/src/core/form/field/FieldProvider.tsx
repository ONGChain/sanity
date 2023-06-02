import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {Path, SchemaType} from '@sanity/types'
import {DocumentFieldAction, DocumentFieldActionNode} from '../../config'
import {pathToString} from '../../field'
import {supportsTouch} from '../../util'
import {FieldContext, FieldContextValue} from './FieldContext'
import {FieldActions} from './FieldActions'
import {useHoveredField} from './useHoveredField'

/** @internal */
export function FieldProvider(
  props: PropsWithChildren<{
    actions: DocumentFieldAction[]
    documentId?: string
    documentType: string
    focused: boolean
    path: Path
    schemaType: SchemaType
  }>
) {
  const {actions, children, documentId, documentType, focused, path, schemaType} = props
  const [actionNodes, setActionNodes] = useState<DocumentFieldActionNode[]>([])
  const {onMouseEnter: onFieldMouseEnter, onMouseLeave: onFieldMouseLeave} = useHoveredField()

  const hoveredPath = useHoveredField().hoveredStack[0]
  const hovered = supportsTouch || (hoveredPath ? pathToString(path) === hoveredPath : false)

  const handleMouseEnter = useCallback(() => {
    onFieldMouseEnter(path)
  }, [onFieldMouseEnter, path])

  const handleMouseLeave = useCallback(() => {
    onFieldMouseLeave(path)
  }, [onFieldMouseLeave, path])

  const context: FieldContextValue = useMemo(
    () => ({
      actions: actionNodes,
      focused,
      hovered,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }),
    [actionNodes, focused, handleMouseEnter, handleMouseLeave, hovered]
  )

  if (!documentId) {
    return <>{children}</>
  }

  return (
    <FieldContext.Provider value={context}>
      <FieldActions
        actions={actions}
        documentId={documentId}
        documentType={documentType}
        onActions={setActionNodes}
        path={path}
        schemaType={schemaType}
      />
      {children}
    </FieldContext.Provider>
  )
}
