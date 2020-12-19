import {combine, forward} from 'effector'

import {changeSources, codeMarkLine, evalEffect, selectVersion} from '.'
import {sourceCode, codeError, version} from './state'
import {retrieveCode, retrieveVersion} from './retrieve'
import {compress} from './compression'
import {evaluator, versionLoader} from '../evaluator'
import {typechecker} from '../settings/state'

evalEffect.use(evaluator)

version.on(selectVersion, (_, p) => p)

codeError
  .on(evalEffect.done, () => ({
    isError: false,
    error: null,
    stackFrames: [],
  }))
  .on(evalEffect.fail, (_, e) => {
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

let textMarker
codeError.watch(async ({stackFrames}) => {
  if (textMarker) textMarker.clear()
  for (const frame of stackFrames) {
    if (frame._originalFileName !== 'repl.js') continue
    const line = (frame._originalLineNumber || 0) - 1
    const ch = frame._originalColumnNumber || 0
    textMarker = await codeMarkLine({
      from: {line, ch},
      options: {className: 'CodeMirror-lint-mark-error'},
    })
  }
})

let lastCode = null

changeSources.watch(codeRaw => {
  const code = compress(codeRaw)
  if (lastCode !== null && lastCode !== code) {
    localStorage.setItem('code-compressed', code)
    history.replaceState({}, '', location.origin)
  }
  lastCode = code || lastCode
})

forward({
  from: changeSources,
  to: sourceCode,
})

const initStore = combine({
  sourceCode,
  versionLoader,
  typechecker,
})
initStore.watch(data => {
  evalEffect(data.sourceCode)
})

changeSources(retrieveCode())
selectVersion(retrieveVersion())
