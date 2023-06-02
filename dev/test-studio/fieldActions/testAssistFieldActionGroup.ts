import {SparklesIcon} from '@sanity/icons'
import {useMemo} from 'react'
import {
  DocumentFieldActionNode,
  unstable_defineDocumentFieldAction as defineDocumentFieldAction,
} from 'sanity'

export const testAssistFieldActionGroup = defineDocumentFieldAction({
  name: 'test/assist',
  useAction({path}) {
    const children: DocumentFieldActionNode[] = useMemo(
      () => [
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
        // {
        //   type: 'divider',
        // },
        {
          // disabled: {reason: 'Not right now'},
          type: 'menuItem',
          title: 'Duplicate',
          tone: 'caution',
          onAction() {
            // eslint-disable-next-line no-console
            console.log('duplicate', path)
          },
        },
      ],
      [path]
    )

    return {
      type: 'group',
      title: 'Assist',
      icon: SparklesIcon,
      children,
      renderAsButton: true,
      // disabled: {reason: 'Not right now'},
    }
  },
})
