import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ObjectSchemaType, Path, SanityDocument, SanityDocumentLike} from '@sanity/types'
import {omit, set} from 'lodash'
import {useToast} from '@sanity/ui'
import {fromString as pathFromString, resolveKeyedPath} from '@sanity/util/paths'
import isHotkey from 'is-hotkey'
import {isActionEnabled} from '@sanity/schema/_internal'
import {usePaneRouter} from '../../components'
import {PaneMenuItem} from '../../types'
import {useDeskTool} from '../../useDeskTool'
import {DocumentPaneContext, DocumentPaneContextValue} from './DocumentPaneContext'
import {getMenuItems} from './menuItems'
import {DocumentPaneProviderProps} from './types'
import {usePreviewUrl} from './usePreviewUrl'
import {getInitialValueTemplateOpts} from './getInitialValueTemplateOpts'
import {
  DEFAULT_MENU_ITEM_GROUPS,
  EMPTY_PARAMS,
  HISTORY_INSPECTOR_NAME,
  INSPECT_ACTION_PREFIX,
} from './constants'
import {DocumentInspectorMenuItemsResolver} from './DocumentInspectorMenuItemsResolver'
import {
  DocumentInspector,
  DocumentPresence,
  PatchEvent,
  StateTree,
  toMutationPatches,
  getExpandOperations,
  getPublishedId,
  setAtPath,
  useConnectionState,
  useDocumentOperation,
  useEditState,
  useFormState,
  useInitialValue,
  usePresenceStore,
  useSchema,
  useSource,
  useTemplates,
  useUnique,
  useValidationStatus,
  getDraftId,
  useDocumentValuePermissions,
  useTimelineStore,
  useTimelineSelector,
  DocumentFieldAction,
  DocumentInspectorMenuItem,
  FieldProvider,
  EMPTY_ARRAY,
} from 'sanity'

/**
 * @internal
 */
// eslint-disable-next-line complexity, max-statements
export const DocumentPaneProvider = memo((props: DocumentPaneProviderProps) => {
  const {children, index, pane, paneKey} = props
  const schema = useSchema()
  const templates = useTemplates()
  const {
    actions: documentActions,
    badges: documentBadges,
    unstable_fieldActions: fieldActionsResolver,
    unstable_languageFilter: languageFilterResolver,
    inspectors: inspectorsResolver,
  } = useSource().document
  const presenceStore = usePresenceStore()
  const paneRouter = usePaneRouter()
  const setPaneParams = paneRouter.setParams
  const {features} = useDeskTool()
  const {push: pushToast} = useToast()
  const {
    options,
    menuItemGroups = DEFAULT_MENU_ITEM_GROUPS,
    title = null,
    views: viewsProp = [],
  } = pane
  const paneOptions = useUnique(options)
  const documentIdRaw = paneOptions.id
  const documentId = getPublishedId(documentIdRaw)
  const documentType = options.type
  const params = useUnique(paneRouter.params) || EMPTY_PARAMS
  const panePayload = useUnique(paneRouter.payload)
  const {templateName, templateParams} = useMemo(
    () =>
      getInitialValueTemplateOpts(templates, {
        documentType,
        templateName: paneOptions.template,
        templateParams: paneOptions.templateParameters,
        panePayload,
        urlTemplate: params.template,
      }),
    [documentType, paneOptions, params, panePayload, templates]
  )
  const initialValueRaw = useInitialValue({
    documentId,
    documentType,
    templateName,
    templateParams,
  })
  const initialValue = useUnique(initialValueRaw)
  const {patch} = useDocumentOperation(documentId, documentType)
  const editState = useEditState(documentId, documentType)
  const {validation: validationRaw} = useValidationStatus(documentId, documentType)
  const connectionState = useConnectionState(documentId, documentType)
  const schemaType = schema.get(documentType) as ObjectSchemaType | undefined
  const value: SanityDocumentLike = editState?.draft || editState?.published || initialValue.value

  const [inspectorMenuItems, setInspectorMenuItems] = useState<DocumentInspectorMenuItem[]>([])

  // Resolve document actions
  const actions = useMemo(
    () => documentActions({schemaType: documentType, documentId}),
    [documentActions, documentId, documentType]
  )

  // Resolve document badges
  const badges = useMemo(
    () => documentBadges({schemaType: documentType, documentId}),
    [documentBadges, documentId, documentType]
  )

  // Resolve document language filter
  const languageFilter = useMemo(
    () => languageFilterResolver({schemaType: documentType, documentId}),
    [documentId, documentType, languageFilterResolver]
  )

  const validation = useUnique(validationRaw)
  const views = useUnique(viewsProp)

  const [focusPath, setFocusPath] = useState<Path>(() =>
    params.path ? pathFromString(params.path) : []
  )
  const activeViewId = params.view || (views[0] && views[0].id) || null
  const [timelineMode, setTimelineMode] = useState<'since' | 'rev' | 'closed'>('closed')

  const [timelineError, setTimelineError] = useState<Error | null>(null)
  /**
   * Create an intermediate store which handles document Timeline + TimelineController
   * creation, and also fetches pre-requsite document snapshots. Compatible with `useSyncExternalStore`
   * and made available to child components via DocumentPaneContext.
   */
  const timelineStore = useTimelineStore({
    documentId,
    documentType,
    onError: setTimelineError,
    rev: params.rev,
    since: params.since,
  })

  // Subscribe to external timeline state changes
  const onOlderRevision = useTimelineSelector(timelineStore, (state) => state.onOlderRevision)
  const revTime = useTimelineSelector(timelineStore, (state) => state.revTime)
  const sinceAttributes = useTimelineSelector(timelineStore, (state) => state.sinceAttributes)
  const timelineDisplayed = useTimelineSelector(timelineStore, (state) => state.timelineDisplayed)
  const timelineReady = useTimelineSelector(timelineStore, (state) => state.timelineReady)

  // TODO: this may cause a lot of churn. May be a good idea to prevent these
  // requests unless the menu is open somehow
  const previewUrl = usePreviewUrl(value)

  const [presence, setPresence] = useState<DocumentPresence[]>([])
  useEffect(() => {
    const subscription = presenceStore.documentPresence(documentId).subscribe((nextPresence) => {
      setPresence(nextPresence)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [documentId, presenceStore])

  const inspectors: DocumentInspector[] = useMemo(
    () => inspectorsResolver({documentId, documentType}),
    [documentId, documentType, inspectorsResolver]
  )

  const [inspectorName, setInspectorName] = useState<string | null>(() => params.inspect || null)

  // Handle inspector name changes from URL
  const inspectParamRef = useRef<string | undefined>(params.inspect)
  useEffect(() => {
    if (inspectParamRef.current !== params.inspect) {
      inspectParamRef.current = params.inspect
      setInspectorName(params.inspect || null)
    }
  }, [params.inspect])

  const currentInspector = inspectors?.find((i) => i.name === inspectorName)
  const resolvedChangesInspector = inspectors.find((i) => i.name === HISTORY_INSPECTOR_NAME)

  const changesOpen = currentInspector?.name === HISTORY_INSPECTOR_NAME

  const hasValue = Boolean(value)
  const menuItems = useMemo(
    () =>
      getMenuItems({
        currentInspector,
        features,
        hasValue,
        inspectorMenuItems,
        inspectors,
        previewUrl,
      }),
    [currentInspector, features, hasValue, inspectorMenuItems, inspectors, previewUrl]
  )
  const inspectOpen = params.inspect === 'on'
  const compareValue: Partial<SanityDocument> | null = changesOpen
    ? sinceAttributes
    : editState?.published || null

  const fieldActions: DocumentFieldAction[] = useMemo(
    () => (schemaType ? fieldActionsResolver({documentId, documentType, schemaType}) : []),
    [documentId, documentType, fieldActionsResolver, schemaType]
  )

  /**
   * Note that in addition to connection and edit state, we also wait for a valid document timeline
   * range to be loaded. This means if we're loading an older revision, the full transaction range must
   * be loaded in full prior to the document being displayed.
   *
   * Previously, visiting studio URLs with timeline params would display the 'current' document and then
   * 'snap' in the older revision, which was disorienting and could happen mid-edit.
   *
   * In the event that the timeline cannot be loaded due to TimelineController errors or blocked requests,
   * we skip this readiness check to ensure that users aren't locked out of editing. Trying to select
   * a timeline revision in this instance will display an error localized to the popover itself.
   */
  const ready =
    connectionState === 'connected' && editState.ready && (timelineReady || !!timelineError)

  const displayed: Partial<SanityDocument> | undefined = useMemo(
    () => (onOlderRevision ? timelineDisplayed || {_id: value._id, _type: value._type} : value),
    [onOlderRevision, timelineDisplayed, value]
  )

  const setTimelineRange = useCallback(
    (newSince: string, newRev: string | null) => {
      setPaneParams({
        ...params,
        since: newSince,
        rev: newRev || undefined,
      })
    },
    [params, setPaneParams]
  )

  const handleFocus = useCallback(
    (nextFocusPath: Path) => {
      setFocusPath(nextFocusPath)
      presenceStore.setLocation([
        {
          type: 'document',
          documentId,
          path: nextFocusPath,
          lastActiveAt: new Date().toISOString(),
        },
      ])
    },
    [documentId, presenceStore, setFocusPath]
  )

  const handleBlur = useCallback(
    (blurredPath: Path) => {
      setFocusPath([])
      // note: we're deliberately not syncing presence here since it would make the user avatar disappear when a
      // user clicks outside a field without focusing another one
    },
    [setFocusPath]
  )

  const patchRef = useRef<(event: PatchEvent) => void>(() => {
    throw new Error('Nope')
  })

  patchRef.current = (event: PatchEvent) => {
    patch.execute(toMutationPatches(event.patches), initialValue.value)
  }

  const handleChange = useCallback((event: PatchEvent) => patchRef.current(event), [])

  const closeInspector = useCallback(
    (closeInspectorName?: string) => {
      // inspector?: DocumentInspector
      const inspector = closeInspectorName && inspectors.find((i) => i.name === closeInspectorName)

      if (closeInspectorName && !inspector) {
        console.warn(`No inspector named "${closeInspectorName}"`)
        return
      }

      if (!currentInspector) {
        return
      }

      if (inspector) {
        const result = inspector.onClose?.({params}) ?? {params}

        setInspectorName(null)
        inspectParamRef.current = undefined

        setPaneParams({...result.params, inspect: undefined})

        return
      }

      if (currentInspector) {
        const result = currentInspector.onClose?.({params}) ?? {params}

        setInspectorName(null)
        inspectParamRef.current = undefined

        setPaneParams({...result.params, inspect: undefined})
      }
    },
    [currentInspector, inspectors, params, setPaneParams]
  )

  const openInspector = useCallback(
    (nextInspectorName: string, paneParams?: Record<string, string>) => {
      const nextInspector = inspectors.find((i) => i.name === nextInspectorName)

      if (!nextInspector) {
        console.warn(`No inspector named "${nextInspectorName}"`)
        return
      }

      // if the inspector is already open, only update params
      if (currentInspector?.name === nextInspector.name) {
        setPaneParams({...params, ...paneParams, inspect: nextInspector.name})
        return
      }

      let currentParams = params

      if (currentInspector) {
        const closeResult = nextInspector.onClose?.({params: currentParams}) ?? {
          params: currentParams,
        }

        currentParams = closeResult.params
      }

      const result = nextInspector.onOpen?.({params: currentParams}) ?? {params: currentParams}

      setInspectorName(nextInspector.name)
      inspectParamRef.current = nextInspector.name

      setPaneParams({...result.params, ...paneParams, inspect: nextInspector.name})
    },
    [currentInspector, inspectors, params, setPaneParams]
  )

  const handleHistoryClose = useCallback(() => {
    if (resolvedChangesInspector) {
      closeInspector(resolvedChangesInspector.name)
    }
  }, [closeInspector, resolvedChangesInspector])

  const handleHistoryOpen = useCallback(() => {
    if (resolvedChangesInspector) {
      openInspector(resolvedChangesInspector.name)
    }
  }, [openInspector, resolvedChangesInspector])

  const handlePaneClose = useCallback(() => paneRouter.closeCurrent(), [paneRouter])

  const handlePaneSplit = useCallback(() => paneRouter.duplicateCurrent(), [paneRouter])

  const toggleLegacyInspect = useCallback(
    (toggle = !inspectOpen) => {
      if (toggle) {
        setPaneParams({...params, inspect: 'on'})
      } else {
        setPaneParams(omit(params, 'inspect'))
      }
    },
    [inspectOpen, params, setPaneParams]
  )

  const handleMenuAction = useCallback(
    (item: PaneMenuItem) => {
      if (item.action === 'production-preview' && previewUrl) {
        window.open(previewUrl)
        return true
      }

      if (item.action === 'inspect') {
        toggleLegacyInspect(true)
        return true
      }

      if (item.action === 'reviewChanges') {
        handleHistoryOpen()
        return true
      }

      if (typeof item.action === 'string' && item.action.startsWith(INSPECT_ACTION_PREFIX)) {
        const nextInspectorName = item.action.slice(INSPECT_ACTION_PREFIX.length)
        const nextInspector = inspectors.find((i) => i.name === nextInspectorName)

        if (nextInspector) {
          if (nextInspector.name === inspectorName) {
            closeInspector(nextInspector.name)
          } else {
            openInspector(nextInspector.name)
          }
          return true
        }
      }

      return false
    },
    [
      closeInspector,
      handleHistoryOpen,
      inspectorName,
      inspectors,
      openInspector,
      previewUrl,
      toggleLegacyInspect,
    ]
  )

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      for (const item of menuItems) {
        if (item.shortcut) {
          if (isHotkey(item.shortcut, event)) {
            event.preventDefault()
            event.stopPropagation()
            handleMenuAction(item)
            return
          }
        }
      }
    },
    [handleMenuAction, menuItems]
  )

  const handleLegacyInspectClose = useCallback(
    () => toggleLegacyInspect(false),
    [toggleLegacyInspect]
  )

  const [openPath, onSetOpenPath] = useState<Path>([])
  const [fieldGroupState, onSetFieldGroupState] = useState<StateTree<string>>()
  const [collapsedPaths, onSetCollapsedPath] = useState<StateTree<boolean>>()
  const [collapsedFieldSets, onSetCollapsedFieldSets] = useState<StateTree<boolean>>()

  const handleOnSetCollapsedPath = useCallback((path: Path, collapsed: boolean) => {
    onSetCollapsedPath((prevState) => setAtPath(prevState, path, collapsed))
  }, [])

  const handleOnSetCollapsedFieldSet = useCallback((path: Path, collapsed: boolean) => {
    onSetCollapsedFieldSets((prevState) => setAtPath(prevState, path, collapsed))
  }, [])

  const handleSetActiveFieldGroup = useCallback(
    (path: Path, groupName: string) =>
      onSetFieldGroupState((prevState) => setAtPath(prevState, path, groupName)),
    []
  )

  const requiredPermission = value._createdAt ? 'update' : 'create'
  const liveEdit = Boolean(schemaType?.liveEdit)
  const docId = value._id ? value._id : 'dummy-id'
  const docPermissionsInput = useMemo(() => {
    return {
      ...value,
      _id: liveEdit ? getPublishedId(docId) : getDraftId(docId),
    }
  }, [liveEdit, value, docId])

  const [permissions, isPermissionsLoading] = useDocumentValuePermissions({
    document: docPermissionsInput,
    permission: requiredPermission,
  })

  const isNonExistent = !value?._id

  const readOnly = useMemo(() => {
    const hasNoPermission = !isPermissionsLoading && !permissions?.granted
    const updateActionDisabled = !isActionEnabled(schemaType!, 'update')
    const createActionDisabled = isNonExistent && !isActionEnabled(schemaType!, 'create')
    const reconnecting = connectionState === 'reconnecting'
    const isLocked = editState.transactionSyncLock?.enabled

    return (
      !ready ||
      revTime !== null ||
      hasNoPermission ||
      updateActionDisabled ||
      createActionDisabled ||
      reconnecting ||
      isLocked
    )
  }, [
    connectionState,
    isNonExistent,
    isPermissionsLoading,
    permissions?.granted,
    ready,
    revTime,
    schemaType,
    editState.transactionSyncLock,
  ])

  const formState = useFormState(schemaType!, {
    value: displayed,
    readOnly,
    comparisonValue: compareValue,
    focusPath,
    openPath,
    collapsedPaths,
    presence,
    validation,
    collapsedFieldSets,
    fieldGroupState,
    changesOpen,
  })

  const formStateRef = useRef(formState)
  formStateRef.current = formState

  const setOpenPath = useCallback(
    (path: Path) => {
      const ops = getExpandOperations(formStateRef.current!, path)
      ops.forEach((op) => {
        if (op.type === 'expandPath') {
          onSetCollapsedPath((prevState) => setAtPath(prevState, op.path, false))
        }
        if (op.type === 'expandFieldSet') {
          onSetCollapsedFieldSets((prevState) => setAtPath(prevState, op.path, false))
        }
        if (op.type === 'setSelectedGroup') {
          onSetFieldGroupState((prevState) => setAtPath(prevState, op.path, op.groupName))
        }
      })
      onSetOpenPath(path)
    },
    [formStateRef]
  )

  const documentPane: DocumentPaneContextValue = {
    actions,
    activeViewId,
    badges,
    changesOpen,
    closeInspector,
    collapsedFieldSets,
    collapsedPaths,
    compareValue,
    connectionState,
    displayed,
    documentId,
    documentIdRaw,
    documentType,
    editState,
    fieldActions,
    focusPath,
    inspector: currentInspector || null,
    inspectors,
    menuItems,
    onBlur: handleBlur,
    onChange: handleChange,
    onFocus: handleFocus,
    onPathOpen: setOpenPath,
    onHistoryClose: handleHistoryClose,
    onHistoryOpen: handleHistoryOpen,
    onInspectClose: handleLegacyInspectClose,
    onKeyUp: handleKeyUp,
    onMenuAction: handleMenuAction,
    onPaneClose: handlePaneClose,
    onPaneSplit: handlePaneSplit,
    onSetActiveFieldGroup: handleSetActiveFieldGroup,
    onSetCollapsedPath: handleOnSetCollapsedPath,
    onSetCollapsedFieldSet: handleOnSetCollapsedFieldSet,
    openInspector,
    index,
    inspectOpen,
    validation,
    menuItemGroups: menuItemGroups || [],
    paneKey,
    previewUrl,
    ready,
    schemaType: schemaType!,
    isPermissionsLoading,
    permissions,
    setTimelineMode,
    setTimelineRange,
    timelineError,
    timelineMode,
    timelineStore,
    title,
    value,
    views,
    formState,
    unstable_languageFilter: languageFilter,
  }

  useEffect(() => {
    if (connectionState === 'reconnecting') {
      pushToast({
        id: 'sanity/desk/reconnecting',
        status: 'warning',
        title: <>Connection lost. Reconnecting…</>,
      })
    }
  }, [connectionState, pushToast])

  // Reset `focusPath` when `documentId` or `params.path` changes
  useEffect(() => {
    if (ready && params.path) {
      const {path, ...restParams} = params
      const pathFromUrl = resolveKeyedPath(formStateRef.current?.value, pathFromString(path))
      // Reset focus path when url params path changes
      setFocusPath(pathFromUrl)
      setOpenPath(pathFromUrl)
      // remove the `path`-param from url after we have consumed it as the initial focus path
      paneRouter.setParams(restParams)
    }
  }, [params, documentId, setOpenPath, ready, paneRouter])

  return (
    <DocumentPaneContext.Provider value={documentPane}>
      {inspectors.length > 0 && (
        <DocumentInspectorMenuItemsResolver
          documentId={documentId}
          documentType={documentType}
          inspectors={inspectors}
          onMenuItems={setInspectorMenuItems}
        />
      )}

      {schemaType ? (
        <FieldProvider
          actions={fieldActions}
          documentId={documentId}
          documentType={documentType}
          focused={false}
          path={EMPTY_ARRAY}
          schemaType={schemaType}
        >
          {children}
        </FieldProvider>
      ) : (
        children
      )}
    </DocumentPaneContext.Provider>
  )
})

DocumentPaneProvider.displayName = 'DocumentPaneProvider'
