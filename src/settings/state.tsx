import {createDomain, combine, Store, createStore} from 'effector'

export const domain = createDomain('settings')

export const tsToggle = domain.store<boolean>(false)
export const typechecker: Store<'typescript' | null> = combine(
  tsToggle,
  (tsEnabled) => {
    if (tsEnabled) return 'typescript'
    return null
  },
)
export const autoScrollLog = createStore<boolean>(true)
