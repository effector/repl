// TODO: remove exact dependency on feature, use requirements in the future
import {consoleMap} from '../features/logs'

import {
  realmInvoke,
  realmInterval,
  realmTimeout,
  realmClearInterval,
  realmClearTimeout,
} from '../realm'

export function prepareRuntime(effector, initViewLib, version: string) {
  const api = {}
  apiMap(api, {
    createEvent: effector.createEvent,
    createEffect: effector.createEffect,
    createStore: effector.createStore,
    createStoreObject: effector.createStoreObject,
    createDomain: effector.createDomain,
    createApi: effector.createApi,
    restoreEvent: effector.restoreEvent,
    restoreEffect: effector.restoreEffect,
    restore: effector.restore,
    combine: effector.combine,
    sample: effector.sample,
    merge: effector.merge,
    split: effector.split,
    clearNode: effector.clearNode,
    _withFactory: effector.withFactory, // TODO: fix babel plugin
  })
  const {lib, env} = initViewLib(apiMap, api)
  assignLibrary(api, effector)
  assignLibrary(api, lib)
  return {
    ...env,
    console: consoleMap(),
    setInterval,
    setTimeout,
    clearInterval,
    clearTimeout,
    __VERSION__: version,
    effector,
    ...api,
  }
}
function clearInterval(id) {
  realmClearInterval(id)
}
function clearTimeout(id) {
  realmClearTimeout(id)
}
function setInterval(callback: Function, timeout?: number, ...args: any[]) {
  const id = global.setInterval(callback, timeout, ...args)
  realmInterval(id)
  return id
}

function setTimeout(callback: Function, timeout?: number, ...args: any[]) {
  const id = global.setTimeout(callback, timeout, ...args)
  realmTimeout(id)
  return id
}

function assignLibrary(target, effector) {
  for (const method in effector) {
    if (method in target) continue
    target[method] = effector[method]
  }
  return target
}

function apiMap(target, obj) {
  for (const key in obj) {
    target[key] = apiFabric.bind(null, obj[key], key)
  }
  return target
}

function apiFabric(fn, key, ...args) {
  const instance = fn(...args)
  realmInvoke({method: key, params: args, instance})
  return instance
}
