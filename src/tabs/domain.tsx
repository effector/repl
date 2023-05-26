import {createApi} from 'effector'
import {createMediaMatcher} from '../lib/media-query'
import {createLocalStore} from '../lib/local-store'

export type Tab =
  | 'dom'
  | 'share'
  | 'editor'
  | 'outline'
  | 'settings'
  | 'gist'
  | 'errors'

export const isDesktopChanges = createMediaMatcher('(min-width: 700px)')

export const tab = createLocalStore<Tab>(
  'current-tab',
  isDesktopChanges.getState() ? 'dom' : 'editor',
)

export const tabApi = createApi(tab, {
  showOutline: () => 'outline',
  showEditor: () => 'editor',
  showDOM: () => 'dom',
  showShare: () => 'share',
  showSettings: () => 'settings',
  showErrors: () => 'errors',
})

tab.on(isDesktopChanges, (state, isDesktop) => {
  if (state === 'editor' && isDesktop) return 'dom'
  if (state === 'outline' && isDesktop) return 'dom'
  return state
})
