import {combine, forward, sample, split} from 'effector'
import md5 from 'js-md5'

import {$githubUser} from '../github/state'
import {getShareListByAuthorFx, shareCodeFx} from '../graphql'

import {
  addShare,
  onKeyDown,
  onTextChange,
  removeShare,
  setCurrentShareId,
  setFilterMode,
} from './index'
import {SharedItem} from './index.h'
import {
  $currentShareId,
  $filterMode,
  $hiddenShareList,
  $shareDescription,
  $shareList,
} from './state'

$currentShareId.on(setCurrentShareId, (_, id) => id)

export const keyDown = split(onKeyDown, {
  Escape: key => key === 'Escape',
  Enter: key => key === 'Enter',
})

forward({
  from: keyDown.Enter,
  to: shareCodeFx,
})

$shareDescription.on(onTextChange, (_, value) => value).reset(keyDown.Escape)

$shareList.on(getShareListByAuthorFx.done, (state, {params, result}) => {
  return {
    ...state,
    [params.author]: result.pages
      .sort((a, b) => a.created - b.created)
      .reduce((acc, record) => {
        const id = md5(record.code)
        acc[id] = {
          author: params.author,
          slug: record.slug,
          description: record.description,
          created: record.created,
          md5: id,
          code: record.code,
        }
        return acc
      }, {}),
  }
})

const sharesWithUser = combine({
  shareList: $shareList,
  githubUser: $githubUser,
})

sample({
  source: sharesWithUser,
  clock: $currentShareId,
  target: $shareDescription,
  fn({shareList, githubUser}, slug) {
    const userShares = shareList[githubUser.databaseId!]
    const currentShare = Object.values(
      userShares || ({} as typeof userShares),
    ).find(share => share.slug === slug)
    return currentShare?.description
  },
})

sample({
  source: sharesWithUser,
  clock: addShare,
  target: $shareList,
  fn({shareList, githubUser}, newShare) {
    const {code, ...rest} = newShare
    return {
      ...shareList,
      [githubUser.databaseId!]: {
        ...shareList[githubUser.databaseId!],
        [newShare.md5]: rest,
      },
    }
  },
})

sample({
  source: sharesWithUser,
  clock: removeShare,
  target: $shareList,
  fn: ({shareList, githubUser}, slug) => ({
    ...shareList,
    [githubUser.databaseId!]: {
      ...Object.values(
        shareList[githubUser.databaseId!] || ({} as SharedItem),
      ).reduce((acc, share) => {
        if (share.slug !== slug) {
          acc[share.md5] = share
        }
        return acc
      }, {} as Record<number, SharedItem>),
    },
  }),
})

$hiddenShareList.on(removeShare, (list, slug) => ({
  ...list,
  [slug]: true,
}))

export const $sortedShareList = combine(
  sharesWithUser,
  $hiddenShareList,
  ({shareList, githubUser}, hiddenShareList) => {
    if (!(githubUser.databaseId! in shareList)) return []

    return Object.values(
      shareList[githubUser.databaseId!] || ({} as Record<string, SharedItem>),
    )
      .filter(
        share =>
          share.author === githubUser.databaseId &&
          !hiddenShareList[share.slug],
      )
      .sort((a, b) => b.created - a.created)
  },
)

$githubUser.watch(({databaseId}) => {
  if (databaseId) {
    getShareListByAuthorFx({author: databaseId})
  }
})

$filterMode.on(setFilterMode, (_, value) => value)
