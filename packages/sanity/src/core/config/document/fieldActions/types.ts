import {Path, SchemaType} from '@sanity/types'
import {ComponentType, ReactNode} from 'react'
import {ComposableOption, ConfigContext} from '../../types'

/** @internal */
export interface DocumentFieldAction {
  name: string
  useAction: DocumentFieldActionHook
}

/** @internal */
export interface DocumentFieldActionHook {
  (props: DocumentFieldActionProps): DocumentFieldActionNode
}

/** @internal */
export interface DocumentFieldActionProps {
  documentId: string
  documentType: string
  path: Path
  schemaType: SchemaType
}

/** @internal */
export interface DocumentFieldActionMenuItem {
  type: 'menuItem'
  disabled?: boolean | {reason: ReactNode}
  hidden?: boolean
  icon?: ComponentType
  onAction: () => void
  renderAsButton?: boolean
  selected?: boolean
  status?: 'info' | 'success' | 'warning' | 'error'
  title: string
  tone?: 'primary' | 'positive' | 'caution' | 'critical'
}

/** @internal */
export interface DocumentFieldActionDivider {
  type: 'divider'
}

/** @internal */
export interface DocumentFieldActionGroup {
  type: 'group'
  children: DocumentFieldActionNode[]
  disabled?: boolean | {reason: ReactNode}
  expanded?: boolean
  hidden?: boolean
  icon?: ComponentType
  renderAsButton?: boolean
  status?: 'info' | 'success' | 'warning' | 'error'
  title: string
  tone?: 'primary' | 'positive' | 'caution' | 'critical'
}

/** @internal */
export type DocumentFieldActionNode =
  | DocumentFieldActionMenuItem
  | DocumentFieldActionGroup
  | DocumentFieldActionDivider

/** @internal */
export interface DocumentFieldActionsResolverContext extends ConfigContext {
  documentId: string
  documentType: string
  schemaType: SchemaType
}

/** @internal */
export type DocumentFieldActionsResolver = ComposableOption<
  DocumentFieldAction[],
  DocumentFieldActionsResolverContext
>
