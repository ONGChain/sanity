import {SparklesIcon} from '@sanity/icons'
import {useMemo} from 'react'
import {DocumentFieldActionNode, defineDocumentFieldAction} from 'sanity'

export const assistFieldActionGroup = defineDocumentFieldAction({
  name: 'test/assist',
  useAction({path}) {
    const children: DocumentFieldActionNode[] = useMemo(
      () => [
        {
          type: 'group',
          title: 'Run instructions',
          expanded: true,
          children: [
            {
              type: 'action',
              icon: SparklesIcon,
              title: 'Instruction 1',
              onAction() {
                // eslint-disable-next-line no-console
                console.log('run 1', path)
              },
            },
            {
              type: 'action',
              icon: SparklesIcon,
              title: 'Instruction 2',
              onAction() {
                // eslint-disable-next-line no-console
                console.log('run 2', path)
              },
            },
          ],
        },
        {
          type: 'action',
          title: 'Manage instructions',
          onAction() {
            // eslint-disable-next-line no-console
            console.log('manage', path)
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
    }
  },
})
