import {Image, PortableTextBlock} from '@sanity/types'

interface WelcomeVideo {
  link?: Link
  videos?: Video[]
}

interface Video {
  description?: PortableTextBlock //PTE
  image?: Image
  title?: string
  youtube?: YouTube[]
}

interface Link {
  url?: string
  title?: string
}

interface YouTube {
  duration?: number
  url?: string
  videoId?: string
}

interface Resource {
  sectionArray?: SectionItem[]
  title?: string
}

export interface SectionItem {
  _key: string
  sectionTitle?: string
  items?: (InternalAction | ExternalLink)[]
}

interface Item {
  _key: string
  title?: string
}

interface ExternalLink extends Item {
  _type: 'externalLink'
  url?: string
}

interface InternalAction extends Item {
  _type: 'internalAction'
  type?: InternalActionType
}

type InternalActionType = 'show-welcome-modal'

export interface ResourcesResponse {
  resources?: Resource
  welcome?: WelcomeVideo
  latestVersion?: string
}
