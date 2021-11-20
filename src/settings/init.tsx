import {sample, forward, guard} from 'effector'

import {
  clickPrettify,
  prettierFx,
  enableAutoScroll,
  disableAutoScroll,
  debugSidsToggleChange,
  reactSSRToggleChange,
  factoriesChange,
  importNameChange,
  addNamesToggleChange,
} from '.'

import {$sourceCode} from '../editor/state'
import {
  localStorageSync,
  $typechecker,
  $autoScrollLog,
  $debugSids,
  $reactSsr,
  $factories,
  $importName,
  $addNames,
} from './state'

localStorageSync.onCreateStore(store => {
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

guard({
  clock: clickPrettify,
  filter: prettierFx.pending.map(pending => !pending),
  source: {
    code: $sourceCode,
    parser: $typechecker.map(parser => parser ?? 'babel'),
  },
  target: prettierFx,
})

forward({
  from: prettierFx.doneData,
  to: $sourceCode,
})

$autoScrollLog.on(enableAutoScroll, _ => true).on(disableAutoScroll, _ => false)

$addNames.on(addNamesToggleChange, addNames => !addNames)
$debugSids.on(debugSidsToggleChange, debug => !debug)
$reactSsr.on(reactSSRToggleChange, reactSsr => !reactSsr)
$factories.on(factoriesChange, (_, factories) => factories)
$importName.on(importNameChange, (_, event) => event.currentTarget.value.trim())
