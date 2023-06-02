import {CopyIcon} from '@sanity/icons'
import {useCallback} from 'react'
import {defineDocumentFieldAction} from 'sanity'

export const copyAction = defineDocumentFieldAction({
  name: 'test/copy',
  useAction({documentId, documentType, path}) {
    const onAction = useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('comment', {documentId, documentType, path})
    }, [documentId, documentType, path])

    return {
      type: 'action',
      icon: CopyIcon,
      onAction,
      title: 'Copy',
    }
  },
})
