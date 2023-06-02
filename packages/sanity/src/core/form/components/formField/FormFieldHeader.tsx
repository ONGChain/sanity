/* eslint-disable camelcase */

import React, {memo} from 'react'
import {Box, Flex} from '@sanity/ui'
import {FormNodeValidation} from '@sanity/types'
import {FieldPresence, FormNodePresence} from '../../../presence'
import {FormFieldHeaderText} from './FormFieldHeaderText'

export interface FormFieldHeaderProps {
  /**
   * @beta
   */
  __unstable_actions?: React.ReactNode
  /**
   * @beta
   */
  validation?: FormNodeValidation[]
  /**
   * @beta
   */
  __unstable_presence?: FormNodePresence[]
  description?: React.ReactNode
  /**
   * The unique ID used to target the actual input element
   */
  inputId?: string
  title?: React.ReactNode
}

export const FormFieldHeader = memo(function FormFieldHeader(props: FormFieldHeaderProps) {
  const {
    __unstable_actions: actions,
    __unstable_presence: presence,
    description,
    inputId,
    title,
    validation,
  } = props

  return (
    <Flex align="flex-end" style={{lineHeight: 1}}>
      <Box flex={1} paddingY={2}>
        <FormFieldHeaderText
          validation={validation}
          description={description}
          inputId={inputId}
          title={title}
        />
      </Box>

      {presence && presence.length > 0 && (
        <Box flex="none">
          <FieldPresence maxAvatars={4} presence={presence} />
        </Box>
      )}

      {actions && (
        <Box flex="none" marginLeft={3}>
          {actions}
        </Box>
      )}
    </Flex>
  )
})
