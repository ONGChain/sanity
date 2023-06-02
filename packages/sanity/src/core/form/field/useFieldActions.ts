import {useContext, useMemo} from 'react'
import {DocumentFieldActionNode} from '../../config'
import {FieldContext} from './FieldContext'

/** @internal */
export function useFieldActions(): DocumentFieldActionNode[] {
  const {actions} = useContext(FieldContext)

  return useMemo(() => filterActions(actions), [actions])
}

function filterActions(actions: DocumentFieldActionNode[]): DocumentFieldActionNode[] {
  return actions
    .filter((node) => {
      if ('hidden' in node) return node.hidden !== true
      return true
    })
    .map((node) => {
      if (node.type === 'group') {
        return {
          ...node,
          children: filterActions(node.children),
        }
      }

      return node
    })
}
