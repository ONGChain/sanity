import {PartialDocumentList, getTypeNamesFromFilter} from './DocumentList'
import {StructureNode} from './StructureNodes'

/**
 * Type for intent parameters (json)
 *
 * @public
 */
export type IntentJsonParams = {[key: string]: any}

/**
 * Type for base intent parameters
 *
 * @public */
export type BaseIntentParams = {
  /* Intent type */
  type?: string
  /* Intent Id */
  id?: string
  /* Intent template */
  template?: string
}

/** @internal */
export const DEFAULT_INTENT_HANDLER = Symbol('Document type list canHandleIntent')

/**
 * Intent parameters
 *
 * @public
 */
export type IntentParams = BaseIntentParams | [BaseIntentParams, IntentJsonParams]

/**
 * Interface for intents
 * @public */
// TODO: intents should be unified somewhere
export interface Intent {
  /* Intent type */
  type: string
  /* Intent parameters */
  params?: IntentParams
}

/**
 * @hidden
 * @beta */
export interface IntentChecker {
  (
    intentName: string,
    params: {[key: string]: any},
    context: {pane: StructureNode; index: number}
  ): boolean
  identity?: symbol
}

/** @internal */
export const defaultIntentChecker: IntentChecker = (intentName, params, {pane}): boolean => {
  const isEdit = intentName === 'edit'
  const isCreate = intentName === 'create'
  const typedSpec = pane as PartialDocumentList
  const paneFilter = typedSpec.options?.filter || ''
  const paneParams = typedSpec.options?.params || {}
  const typeNames = typedSpec.schemaTypeName
    ? [typedSpec.schemaTypeName]
    : getTypeNamesFromFilter(paneFilter, paneParams)

  const initialValueTemplates = typedSpec.initialValueTemplates || []

  if (isCreate && params.template) {
    return initialValueTemplates.some((tpl) => tpl.templateId === params.template)
  }

  return (
    (isEdit && params.id && typeNames.includes(params.type)) ||
    (isCreate && typeNames.includes(params.type))
  )
}

defaultIntentChecker.identity = DEFAULT_INTENT_HANDLER
