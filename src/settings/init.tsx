import {forward, guard} from 'effector'

import {
  addNamesToggleChange,
  clickPrettify,
  debugSidsToggleChange,
  disableAutoScroll,
  enableAutoScroll,
  factoriesChange,
  importNameChange,
  prettierFx,
  reactSSRToggleChange,
  setSettings,
} from '.'

import {$sourceCode} from '../editor/state'
import {
  $addNames,
  $autoScrollLog,
  $debugSids,
  $factories,
  $importName,
  $reactSsr,
  $typechecker,
  localStorageSync,
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

$addNames
  .on(addNamesToggleChange, addNames => !addNames)
  .on(setSettings, (_, {addNames}) => addNames)
$debugSids
  .on(debugSidsToggleChange, debug => !debug)
  .on(setSettings, (_, {debugSids}) => debugSids)
$reactSsr
  .on(reactSSRToggleChange, reactSsr => !reactSsr)
  .on(setSettings, (_, {reactSsr}) => reactSsr)
$factories
  .on(factoriesChange, (_, factories) => factories)
  .on(setSettings, (_, {factories}) => factories)
$importName
  .on(importNameChange, (_, event) => event.currentTarget.value.trim())
  .on(setSettings, (_, {importName}) => importName)
