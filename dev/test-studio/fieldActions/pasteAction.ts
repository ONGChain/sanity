import {ClipboardIcon} from '@sanity/icons'
import {useCallback} from 'react'
import {defineDocumentFieldAction} from 'sanity'

export const pasteAction = defineDocumentFieldAction({
  name: 'test/paste',
  useAction({documentId, documentType, path}) {
    const onAction = useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('paste', {documentId, documentType, path})
    }, [documentId, documentType, path])

    return {
      type: 'action',
      icon: ClipboardIcon,
      onAction,
      title: 'Paste',
    }
  },
})
