import {useContext} from 'react'
import {FieldContext, FieldContextValue} from './FieldContext'

/** @internal */
export function useField(): FieldContextValue {
  return useContext(FieldContext)
}
