import {CollectionBuilder, Collection, SerializeOptions} from './StructureNodes'
import {StructureContext} from './types'
import {Observable} from 'rxjs'

/**
 * @hidden
 * @beta */
// TODO: unify with the RouterSplitPaneContext
export interface ChildResolverOptions {
  parent: unknown
  index: number
  splitIndex: number
  path: string[]
  params: Record<string, string | undefined>
  structureContext: StructureContext
  serializeOptions?: SerializeOptions
}

/**
 * Type for Item Child
 *
 * @public
 */
export type ItemChild = CollectionBuilder | Collection | undefined

/**
 * Interface for child observable
 *
 * @public
 */
export interface ChildObservable {
  subscribe: (child: ItemChild | Promise<ItemChild>) => Record<string, unknown>
}

/**
 * Interface for child resolver
 *
 * @public */
// TODO: unify with PaneNodeResolver in desk-tool
export interface ChildResolver {
  (itemId: string, options: ChildResolverOptions):
    | ItemChild
    | Promise<ItemChild>
    | ChildObservable
    | Observable<ItemChild>
    | undefined
}
