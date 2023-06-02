import {Box, Label, MenuGroup} from '@sanity/ui'
import React from 'react'
import {DocumentFieldActionGroup} from '../../config'
import {FieldActionMenuNode} from './FieldActionMenuNode'

export function FieldActionMenuGroup(props: {group: DocumentFieldActionGroup}) {
  const {group} = props

  if (group.expanded) {
    return (
      <>
        <Box padding={2} paddingBottom={1}>
          <Label muted size={0}>
            {group.title}
          </Label>
        </Box>

        {group.children.map((item, idx) => (
          <FieldActionMenuNode
            action={item}
            isFirst={idx === 0}
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            prevIsGroup={group.children[idx - 1]?.type === 'group'}
          />
        ))}
      </>
    )
  }

  return (
    <MenuGroup
      fontSize={1}
      icon={group.icon}
      padding={2}
      popover={{placement: 'right', fallbackPlacements: ['top', 'bottom']}}
      space={2}
      text={group.title}
      tone={group.tone}
    >
      {group.children.map((item, idx) => (
        <FieldActionMenuNode
          action={item}
          isFirst={idx === 0}
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          prevIsGroup={group.children[idx - 1]?.type === 'group'}
        />
      ))}
    </MenuGroup>
  )
}
