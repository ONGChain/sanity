import i18n from 'i18next'
import k from './../../../../i18n/keys'
import {Box, Card, Flex, Spinner, Text} from '@sanity/ui'
import React, {useEffect} from 'react'
import {RouterPanes} from '../../../types'
import {Delay} from '../../Delay'
import {useRouter} from 'sanity/router'

interface RedirectProps {
  panes: RouterPanes
}

export function Redirect({panes}: RedirectProps) {
  const {navigate} = useRouter()

  useEffect(() => {
    // Navigates to passed router panes state on mount
    navigate({panes}, {replace: true})
  }, [navigate, panes])

  return (
    <Card height="fill">
      <Delay ms={300}>
        <Flex align="center" direction="column" height="fill" justify="center">
          <Spinner muted />
          <Box marginTop={3}>
            <Text muted size={1}>
              {i18n.t(k.REDIRECTING)}
            </Text>
          </Box>
        </Flex>
      </Delay>
    </Card>
  )
}
