import {combine, createDomain, createStore, Store} from 'effector'

export const localStorageSync = createDomain('settings')

export const $tsToggle = localStorageSync.createStore<boolean>(false)
export const $typechecker: Store<'typescript' | null> = $tsToggle.map(
  tsEnabled => (tsEnabled ? 'typescript' : null),
)
export const $autoScrollLog = createStore<boolean>(true)

export const $addNames = localStorageSync.createStore<boolean | null>(true)
export const $debugSids = localStorageSync.createStore<boolean | null>(null)
export const $factories = localStorageSync.createStore<string[]>([])
export const $importName = localStorageSync.createStore<string | null>(null)
export const $reactSsr = localStorageSync.createStore<boolean | null>(null)
export const $viewLib = localStorageSync.createStore<string>('react')

export const $babelPluginSettings = combine(
  {
    addNames: $addNames,
    debugSids: $debugSids,
    factories: $factories,
    importName: $importName,
    reactSsr: $reactSsr,
  },
  options => {
    const pairs = Object.entries(options)
    const reconstructed = Object.fromEntries(
      pairs.filter(([, value]) => hasValue(value)),
    )
    return reconstructed as Partial<RemoveNull<typeof options>>
  },
)

function hasValue(value: any) {
  return (
    (value !== '' && value !== null) ||
    (Array.isArray(value) && value.length > 0)
  )
}

type RemoveNull<T> = {[Key in keyof T]: NonNullable<T[Key]>}
