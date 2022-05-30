import {createStore} from 'effector'

import {StackFrame} from '../evaluator/stackframe/stack-frame'
import {$typechecker} from '../settings/state'
import defaultVersions from '../versions.json'
import defaultViewLibraries from '../viewLibraries.json'
import {retrieveCode} from './retrieve'

export const $version = createStore(defaultVersions[0])
export const $packageVersions = createStore(defaultVersions)
export const $viewLibraries = createStore(defaultViewLibraries)
export const $sourceCode = createStore(retrieveCode())
export const $compiledCode = createStore('')
export const $codeError = createStore<
  | {
      isError: true
      error: Error
      stackFrames: StackFrame[]
    }
  | {
      isError: false
      error: null
      stackFrames: StackFrame[]
    }
>({
  isError: false,
  error: null,
  stackFrames: [],
})

export const $mode = $typechecker.map((typechecker): string => {
  if (typechecker === 'typescript') return 'text/typescript-jsx'
  return 'text/flow-jsx'
})
