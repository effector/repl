import {sample, forward, guard} from 'effector'

import {sourceCode} from '../editor/state'

import {clickPrettify, prettierFx, enableAutoScroll, disableAutoScroll} from '.'
import {domain, $typechecker, $autoScrollLog} from './state'

domain.onCreateStore(store => {
  const snapshot = localStorage.getItem(store.compositeName.fullName)
  if (snapshot != null) {
    const data = JSON.parse(snapshot)
    store.setState(data)
  }

  store.updates.watch(newState => {
    localStorage.setItem(store.compositeName.fullName, JSON.stringify(newState))
  })
  return store
})

prettierFx.use(async ({code, parser}) => {
  const req = await fetch('https://codebox.now.sh/prettier', {
    method: 'POST',
    body: JSON.stringify({code, config: {parser}}),
  })
  const result = await req.json()
  if (typeof result.code !== 'string') {
    console.error('prettier request error', result)
    throw Error('request failed')
  }
  return result.code
})

sample({
  source: {
    code: sourceCode,
    parser: $typechecker.map(parser => parser ?? 'babel'),
  },
  clock: guard(clickPrettify, {
    filter: prettierFx.pending.map(pending => !pending),
  }),
  target: prettierFx,
})

forward({
  from: prettierFx.doneData,
  to: sourceCode,
})

$autoScrollLog.on(enableAutoScroll, _ => true).on(disableAutoScroll, _ => false)
