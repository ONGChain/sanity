import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {Path} from '@sanity/types'
import {isShallowEmptyObject} from '@sanity/util/content'
import {useDidUpdate} from '../../../hooks/useDidUpdate'
import {FieldMember, ObjectFormNode} from '../../../store'
import {
  ArrayOfObjectsInputProps,
  ObjectFieldProps,
  ObjectInputProps,
  RenderAnnotationCallback,
  RenderArrayOfObjectsItemCallback,
  RenderBlockCallback,
  RenderFieldCallback,
  RenderInputCallback,
  RenderPreviewCallback,
} from '../../../types'
import {PatchArg, PatchEvent, setIfMissing, unset} from '../../../patch'
import {FormCallbacksProvider, useFormCallbacks} from '../../../studio/contexts/FormCallbacks'
import {createProtoValue} from '../../../utils/createProtoValue'
import {applyAll} from '../../../patch/applyPatch'
import {FieldActionMenu, FieldProvider, useFieldActions} from '../../../field'
import {useFormBuilder} from '../../../useFormBuilder'
import {pathToString} from '../../../../field'

/**
 * Responsible for creating inputProps and fieldProps to pass to ´renderInput´ and ´renderField´ for an object input
 * Note: "ObjectField" in this context means an object field of an object type (not "a field of an object")
 * @param props - Component props
 */
export const ObjectField = function ObjectField(props: {
  member: FieldMember<ObjectFormNode>
  renderAnnotation?: RenderAnnotationCallback
  renderBlock?: RenderBlockCallback
  renderField: RenderFieldCallback
  renderInlineBlock?: RenderBlockCallback
  renderInput: RenderInputCallback
  renderItem: RenderArrayOfObjectsItemCallback
  renderPreview: RenderPreviewCallback
}) {
  const {member} = props
  const {__internal, focusPath} = useFormBuilder()
  const {documentId, field} = __internal
  const focused = pathToString(focusPath) === pathToString(member.field.path)

  const {
    onPathBlur,
    onPathFocus,
    onChange,
    onPathOpen,
    onSetPathCollapsed,
    onSetFieldSetCollapsed,
    onFieldGroupSelect,
  } = useFormCallbacks()

  // Keep a local reference to the most recent value. See comment in `handleChange` below for more details
  const pendingValue = useRef(member.field.value)

  useEffect(() => {
    // if the props value has changed, then we should update the pending value
    pendingValue.current = member.field.value
  }, [member.field.value])

  const handleChange = useCallback(
    (event: PatchEvent | PatchArg) => {
      const isRoot = member.field.path.length === 0

      // this handle touches on more than just object fields, documents included
      // if we're at a "document" level, then we want to have a way to skip the following logic
      if (!isRoot) {
        const patches = PatchEvent.from(event).patches
        // Apply the patch to a local cache of the last received field value from props.
        // We might receive several calls to `handleChange` synchronously within the same update cycle before React
        // passes the updated value back through props member.field.value, so we want to check if it's become empty, we can't do that by looking at the stale `props.member.field.value`
        // Instead we keep updating the local ref/value as we receive the patches
        pendingValue.current = applyAll(pendingValue.current || {}, patches)

        // if the result after applying the patches is empty, then we should unset the field
        if (pendingValue.current && isShallowEmptyObject(pendingValue.current)) {
          onChange(PatchEvent.from(unset([member.name])))
          return
        }
      }
      // otherwise apply the patch
      onChange(
        PatchEvent.from(event)
          .prepend(setIfMissing(createProtoValue(member.field.schemaType)))
          .prefixAll(member.name)
      )
    },
    [onChange, member, pendingValue]
  )

  return (
    <FormCallbacksProvider
      onFieldGroupSelect={onFieldGroupSelect}
      onChange={handleChange}
      onSetFieldSetCollapsed={onSetFieldSetCollapsed}
      onPathOpen={onPathOpen}
      onSetPathCollapsed={onSetPathCollapsed}
      onPathBlur={onPathBlur}
      onPathFocus={onPathFocus}
    >
      <FieldProvider
        actions={field.actions}
        documentId={documentId}
        documentType={member.field.schemaType.name}
        focused={focused}
        path={member.field.path}
        schemaType={member.field.schemaType}
      >
        <Field {...props} onChange={handleChange} />
      </FieldProvider>
    </FormCallbacksProvider>
  )
}

function Field(props: {
  member: FieldMember<ObjectFormNode>
  onChange: (event: PatchEvent | PatchArg) => void
  renderAnnotation?: RenderAnnotationCallback
  renderBlock?: RenderBlockCallback
  renderField: RenderFieldCallback
  renderInlineBlock?: RenderBlockCallback
  renderInput: RenderInputCallback
  renderItem: RenderArrayOfObjectsItemCallback
  renderPreview: RenderPreviewCallback
}) {
  const {
    member,
    onChange,
    renderAnnotation,
    renderBlock,
    renderField,
    renderInlineBlock,
    renderInput,
    renderItem,
    renderPreview,
  } = props

  const {
    onPathBlur,
    onPathFocus,
    onPathOpen,
    onSetPathCollapsed,
    onSetFieldSetCollapsed,
    onFieldGroupSelect,
  } = useFormCallbacks()

  const actions = useFieldActions()

  const focusRef = useRef<{focus: () => void}>()

  useDidUpdate(member.field.focused, (hadFocus, hasFocus) => {
    if (!hadFocus && hasFocus) {
      focusRef.current?.focus()
    }
  })

  const handleBlur = useCallback(() => {
    onPathBlur(member.field.path)
  }, [member.field.path, onPathBlur])

  const handleFocus = useCallback(() => {
    onPathFocus(member.field.path)
  }, [member.field.path, onPathFocus])

  const handleFocusChildPath = useCallback(
    (path: Path) => {
      onPathFocus(member.field.path.concat(path))
    },
    [member.field.path, onPathFocus]
  )

  const handleCollapse = useCallback(() => {
    onSetPathCollapsed(member.field.path, true)
  }, [onSetPathCollapsed, member.field.path])

  const handleExpand = useCallback(() => {
    onSetPathCollapsed(member.field.path, false)
  }, [onSetPathCollapsed, member.field.path])

  const handleCollapseField = useCallback(
    (fieldName: string) => {
      onSetPathCollapsed(member.field.path.concat(fieldName), true)
    },
    [onSetPathCollapsed, member.field.path]
  )
  const handleExpandField = useCallback(
    (fieldName: string) => {
      onSetPathCollapsed(member.field.path.concat(fieldName), false)
    },
    [onSetPathCollapsed, member.field.path]
  )
  const handleOpenField = useCallback(
    (fieldName: string) => {
      onPathOpen(member.field.path.concat(fieldName))
    },
    [onPathOpen, member.field.path]
  )
  const handleCloseField = useCallback(() => {
    onPathOpen(member.field.path)
  }, [onPathOpen, member.field.path])
  const handleExpandFieldSet = useCallback(
    (fieldsetName: string) => {
      onSetFieldSetCollapsed(member.field.path.concat(fieldsetName), false)
    },
    [onSetFieldSetCollapsed, member.field.path]
  )
  const handleCollapseFieldSet = useCallback(
    (fieldsetName: string) => {
      onSetFieldSetCollapsed(member.field.path.concat(fieldsetName), true)
    },
    [onSetFieldSetCollapsed, member.field.path]
  )

  const handleOpen = useCallback(() => {
    onPathOpen(member.field.path)
  }, [onPathOpen, member.field.path])

  const handleClose = useCallback(() => {
    onPathOpen(member.field.path.slice(0, -1))
  }, [onPathOpen, member.field.path])

  const handleSelectFieldGroup = useCallback(
    (groupName: string) => {
      onFieldGroupSelect(member.field.path, groupName)
    },
    [onFieldGroupSelect, member.field.path]
  )

  const elementProps = useMemo(
    (): ArrayOfObjectsInputProps['elementProps'] => ({
      onBlur: handleBlur,
      onFocus: handleFocus,
      id: member.field.id,
      ref: focusRef,
    }),
    [handleBlur, handleFocus, member.field.id]
  )

  const inputProps = useMemo((): Omit<ObjectInputProps, 'renderDefault'> => {
    return {
      elementProps,
      level: member.field.level,
      members: member.field.members,
      value: member.field.value,
      readOnly: member.field.readOnly,
      validation: member.field.validation,
      presence: member.field.presence,
      schemaType: member.field.schemaType,
      changed: member.field.changed,
      id: member.field.id,
      onFieldGroupSelect: handleSelectFieldGroup,
      onFieldOpen: handleOpenField,
      onFieldClose: handleCloseField,
      onFieldCollapse: handleCollapseField,
      onFieldExpand: handleExpandField,
      onFieldSetExpand: handleExpandFieldSet,
      onFieldSetCollapse: handleCollapseFieldSet,
      onPathFocus: handleFocusChildPath,
      path: member.field.path,
      focusPath: member.field.focusPath,
      focused: member.field.focused,
      groups: member.field.groups,
      onChange,
      renderAnnotation,
      renderBlock,
      renderField,
      renderInlineBlock,
      renderInput,
      renderItem,
      renderPreview,
    }
  }, [
    elementProps,
    member.field.level,
    member.field.members,
    member.field.value,
    member.field.readOnly,
    member.field.validation,
    member.field.presence,
    member.field.schemaType,
    member.field.changed,
    member.field.id,
    member.field.path,
    member.field.focusPath,
    member.field.focused,
    member.field.groups,
    handleSelectFieldGroup,
    handleOpenField,
    handleCloseField,
    handleCollapseField,
    handleExpandField,
    handleExpandFieldSet,
    handleCollapseFieldSet,
    handleFocusChildPath,
    onChange,
    renderAnnotation,
    renderBlock,
    renderField,
    renderInlineBlock,
    renderInput,
    renderItem,
    renderPreview,
  ])

  const renderedInput = useMemo(() => renderInput(inputProps), [inputProps, renderInput])

  const fieldProps = useMemo((): Omit<ObjectFieldProps, 'renderDefault'> => {
    return {
      actions: actions.length > 0 ? <FieldActionMenu nodes={actions} /> : undefined,
      name: member.name,
      index: member.index,
      level: member.field.level,
      value: member.field.value,
      validation: member.field.validation,
      presence: member.field.presence,
      title: member.field.schemaType.title,
      description: member.field.schemaType.description,

      collapsible: member.collapsible,
      collapsed: member.collapsed,
      onCollapse: handleCollapse,
      onExpand: handleExpand,

      open: member.open,
      changed: member.field.changed,

      onOpen: handleOpen,
      onClose: handleClose,

      schemaType: member.field.schemaType,
      inputId: member.field.id,
      path: member.field.path,
      children: renderedInput,
      inputProps: inputProps as ObjectInputProps,
    }
  }, [
    actions,
    member.name,
    member.index,
    member.field.level,
    member.field.value,
    member.field.validation,
    member.field.presence,
    member.field.schemaType,
    member.field.changed,
    member.field.id,
    member.field.path,
    member.collapsible,
    member.collapsed,
    member.open,
    handleCollapse,
    handleExpand,
    handleOpen,
    handleClose,
    renderedInput,
    inputProps,
  ])

  return <>{renderField(fieldProps)}</>
}
