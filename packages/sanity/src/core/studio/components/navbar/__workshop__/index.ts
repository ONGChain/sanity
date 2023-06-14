import {defineScope} from '@sanity/ui-workshop'
import {lazy} from 'react'

export default defineScope({
  name: 'core/studio/navbar/base',
  title: 'Navbar',
  stories: [
    {
      name: 'navbar',
      title: 'Navbar',
      component: lazy(() => import('./NavbarStory')),
    },
    {
      name: 'workspacePreview',
      title: 'WorkspacePreview',
      component: lazy(() => import('./WorkspacePreviewStory')),
    },
    {
      name: 'help-resources-dropdown',
      title: 'HelpResourcesDropdown',
      component: lazy(() => import('./HelpResourcesStory')),
    },
    {
      name: 'new-document-button',
      title: 'NewDocumentButton',
      component: lazy(() => import('./NewDocumentButtonStory')),
    },
  ],
})
