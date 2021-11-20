import {createDomain, createStore, Store} from 'effector'

export const domain = createDomain('settings')

export const $tsToggle = domain.createStore<boolean>(false)
export const $typechecker: Store<'typescript' | null> = $tsToggle.map(
  tsEnabled => tsEnabled ? 'typescript' : null,
)
export const $autoScrollLog = createStore<boolean>(true)
