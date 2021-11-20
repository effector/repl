import {createStore, Store} from 'effector'

import {retrieveCode} from './retrieve'
import defaultVersions from '../versions.json'
import {StackFrame} from '../evaluator/stackframe/stack-frame'
import {$typechecker} from '../settings/state'

export const version: Store<string> = createStore(defaultVersions[0])
export const packageVersions: Store<string[]> = createStore(defaultVersions)
export const sourceCode: Store<string> = createStore(retrieveCode())
export const compiledCode: Store<string> = createStore('')
export const codeError = createStore<
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

export const mode = $typechecker.map((typechecker): string => {
  if (typechecker === 'typescript') return 'text/typescript-jsx'
  return 'text/flow-jsx'
})
