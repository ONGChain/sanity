import {SparklesIcon} from '@sanity/icons'
import {useCallback, useMemo} from 'react'
import {
  DocumentFieldActionNode,
  unstable_defineDocumentFieldAction as defineDocumentFieldAction,
  isReferenceSchemaType,
} from 'sanity'

export const testFieldActionGroup = defineDocumentFieldAction({
  name: 'test',
  useAction: (props) => {
    const {documentId, path, schemaType} = props

    const onAction = useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('test action', {documentId, path})
    }, [documentId, path])

    const children: DocumentFieldActionNode[] = useMemo(
      () => [
        // {
        //   type: 'menuItem',
        //   icon: SparklesIcon,
        //   onAction,
        //   title: 'Test action',
        // },
        {
          type: 'group',
          title: 'Instructions',
          expanded: true,
          children: [
            {
              type: 'menuItem',
              icon: SparklesIcon,
              title: 'Instruction 1',
              onAction() {
                //
              },
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'menuItem',
          icon: SparklesIcon,
          onAction,
          title: 'Test action',
          // status: 'success',
          tone: 'critical',
        },
      ],
      [onAction]
    )

    return {
      type: 'group',
      children,
      disabled: {reason: 'Disabled for testing'},
      hidden: isReferenceSchemaType(schemaType),
      icon: SparklesIcon,
      renderAsButton: true,
      title: 'Test group',
    }
  },
})
