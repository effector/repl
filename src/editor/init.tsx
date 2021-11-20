import {forward, sample} from 'effector'
import {debounce} from 'patronum/debounce'

import {changeSources, evalFx, selectVersion} from '.'

import {evaluator, versionLoader} from '../evaluator'
import {$babelPluginSettings, $typechecker} from '../settings/state'
import {compress} from './compression'
import {retrieveCode, retrieveVersion} from './retrieve'
import {$sourceCode, $codeError, $version} from './state'

evalFx.use(evaluator)

$version.on(selectVersion, (_, p) => p)

$codeError
  .on(evalFx.done, () => ({
    isError: false,
    error: null,
    stackFrames: [],
  }))
  .on(evalFx.fail, (_, e) => {
    if ('stack' in e.error) {
      return {
        isError: true,
        error: e.error,
        stackFrames: [],
      }
    }
    return {
      isError: true,
      error: e.error.original,
      stackFrames: e.error.stackFrames,
    }
  })

// let textMarker
// codeError.watch(async ({stackFrames}) => {
//   if (textMarker) textMarker.clear()
//   for (const frame of stackFrames) {
//     if (frame._originalFileName !== 'repl.js') continue
//     const line = (frame._originalLineNumber || 0) - 1
//     const ch = frame._originalColumnNumber || 0
//     textMarker = await codeMarkLine({
//       from: {line, ch},
//       options: {className: 'CodeMirror-lint-mark-error'},
//     })
//   }
// })

let lastCode: string | null = null

changeSources.watch(codeRaw => {
  const code = compress(codeRaw)
  if (lastCode !== null && lastCode !== code) {
    localStorage.setItem('code-compressed', code)
    sessionStorage && sessionStorage.setItem('code-compressed', code)
    history.replaceState({}, '', location.origin)
  }
  lastCode = code || lastCode
})

forward({
  from: changeSources,
  to: $sourceCode,
})

const debouncedPluginSettings = debounce({
  source: $babelPluginSettings,
  timeout: 400,
})

sample({
  source: $sourceCode,
  clock: [$sourceCode, versionLoader, $typechecker, debouncedPluginSettings],
  target: evalFx,
})

evalFx($sourceCode.getState())
changeSources(retrieveCode())
selectVersion(retrieveVersion())
