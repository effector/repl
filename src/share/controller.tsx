import {
  createStore,
  createEvent,
  createEffect,
  forward,
  sample,
  guard,
  Effect,
  Store,
  Event,
} from 'effector'
import React from 'react'

import {isShareAPISupported} from '../device'
import {$sourceCode} from '../editor/state'
import {shareCodeFx} from '../graphql'
import {setCurrentShareId} from './index'

export const pressCtrlS = createEvent()

guard({
  source: pressCtrlS,
  filter: shareCodeFx.pending.map(pending => !pending),
  target: shareCodeFx,
})

document.addEventListener(
  'keydown',
  e => {
    if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
      e.preventDefault()
      pressCtrlS()
    }
  },
  false,
)

shareCodeFx.done.watch(({result: {slug}}) => {
  // if (/https\:\/\/(share\.)?effector\.dev/.test(location.origin)) {
  history.pushState({slug}, slug, `${location.origin}/${slug}`)
  setCurrentShareId(slug)
  // }
})

const slug = createStore('').on(
  shareCodeFx.done,
  (state, {result}) => result.slug,
)
export const sharedUrl: Store<string> = createStore('').on(
  slug,
  (state, slug) => `${location.origin}/${slug}`,
)
shareCodeFx.fail.watch(e => console.log('fail', e))

export const canShare: Store<boolean> = slug.map(url => url !== '')

export const clickShare: Event<any> = createEvent()

type Sharing = Effect<{slug: string; sharedUrl: string}, void>
export const sharing: Sharing = createEffect('sharing url', {
  async handler({slug, sharedUrl}) {
    if (isShareAPISupported) {
      await navigator.share({
        title: `Share url ${slug}`,
        url: sharedUrl,
      })
      return
    }
    const ref = urlRef.current
    if (!ref) return
    ref.select()
    document.execCommand('copy')
  },
})
const unexpectedSharingError = sharing.fail.filter({
  fn: ({error}) => error.name !== 'AbortError',
})
unexpectedSharingError.watch(({error}) => {
  console.error(error)
})
sample({
  source: {slug, sharedUrl},
  clock: clickShare,
  target: sharing,
})

export const urlRef: any = React.createRef()
