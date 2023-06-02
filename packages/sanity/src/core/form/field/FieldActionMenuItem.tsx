import {MenuItem, Text} from '@sanity/ui'
import React, {useCallback} from 'react'
import {DisabledTooltip} from '../../components'
import {DocumentFieldActionMenuItem} from '../../config'

export function FieldActionMenuItem(props: {action: DocumentFieldActionMenuItem}) {
  const {action} = props

  const handleClick = useCallback(() => {
    action.onAction()
  }, [action])

  const disabledTooltipContent = typeof action.disabled === 'object' && (
    <Text size={1}>{action.disabled.reason}</Text>
  )

  return (
    <DisabledTooltip content={disabledTooltipContent} placement="left">
      <MenuItem
        disabled={Boolean(action.disabled)}
        fontSize={1}
        icon={action.icon}
        onClick={handleClick}
        padding={2}
        space={2}
        text={action.title}
        tone={action.tone}
      />
    </DisabledTooltip>
  )
}
