import {CopyIcon} from '@sanity/icons'
import {useCallback} from 'react'
import {
  unstable_defineDocumentFieldAction as defineDocumentFieldAction,
  // useFormValue
} from 'sanity'

export const copyAction = defineDocumentFieldAction({
  name: 'test/copy',
  useAction({path}) {
    const value = undefined
    // const value = useFormValue(path)

    const onAction = useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('copy', {path, value})
    }, [path, value])

    return {
      type: 'menuItem',
      icon: CopyIcon,
      onAction,
      title: 'Copy',
    }
  },
})
