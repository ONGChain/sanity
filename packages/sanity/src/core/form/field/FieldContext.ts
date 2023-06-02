import {MouseEvent, createContext} from 'react'
import {DocumentFieldActionNode} from '../../config'

/** @internal */
export interface FieldContextValue {
  actions: DocumentFieldActionNode[]
  focused: boolean
  hovered: boolean
  onMouseEnter: (event: MouseEvent) => void
  onMouseLeave: (event: MouseEvent) => void
}

/** @internal */
export const FieldContext = createContext<FieldContextValue>({
  actions: [],
  focused: false,
  hovered: false,
  onMouseEnter: () => undefined,
  onMouseLeave: () => undefined,
})
