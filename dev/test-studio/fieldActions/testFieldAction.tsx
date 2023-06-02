import {SparklesIcon} from '@sanity/icons'
import {useCallback} from 'react'
import {
  unstable_defineDocumentFieldAction as defineDocumentFieldAction,
  isReferenceSchemaType,
} from 'sanity'

export const testFieldAction = defineDocumentFieldAction({
  name: 'test',
  useAction(props) {
    const {documentId, path, schemaType} = props

    const onAction = useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('test action', {documentId, path})
    }, [documentId, path])

    return {
      type: 'menuItem',
      hidden: isReferenceSchemaType(schemaType),
      icon: SparklesIcon,
      onAction,
      selected: true,
      title: 'Test action',
    }
  },
})
