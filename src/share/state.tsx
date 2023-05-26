import {createStore} from 'effector'
import {createLocalStore} from '../lib/local-store'
import {SharedItem} from './index.h'

const shareListBackup = localStorage.getItem('share-list-backup')

if (!shareListBackup) {
  const shareListOrigin = localStorage.getItem('share-list') || '{}'
  localStorage.setItem('share-list-backup', shareListOrigin)
}

export const $shareList = createLocalStore(
  'share-list',
  {} as Record<number, Record<string, SharedItem>>,
)
export const $hiddenShareList = createLocalStore(
  'share-list-hidden',
  {} as Record<string, boolean>,
)
export const $currentShareId = createStore(null)
export const $shareDescription = createStore('')

export const $filterMode = createLocalStore<Boolean>('filter-mode', true)
