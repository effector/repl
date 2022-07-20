import {createStore, createEvent, restore} from 'effector'

import * as requirements from './requirements'
import {Method} from './types'

interface Log {
  id: number
  method: Method
  data: any[]
}

export const logsClear = createEvent()
const logHappened = createEvent<{method: Method; args: any[]}>()
const logParsedAdded = logHappened.map(parseLog)

export const autoScrollEnableClicked = createEvent()
export const autoScrollDisableClicked = createEvent()

export const $autoScrollLog = restore(requirements.autoScrollLogChanged, true)
export const $logs = createStore<Log[]>([])

$logs
  .on(logParsedAdded, (logs, log) => logs.concat(log))
  .on(requirements.realmActiveChanged, (logs, active) => {
    if (!active) return logs
    return []
  })
  .reset(requirements.sourcesChanged, requirements.versionChanged)
  .reset(logsClear)

window.addEventListener(
  'keydown',
  event => {
    if (
      (event.ctrlKey && event.code === 'KeyL') ||
      (event.metaKey && event.code === 'KeyK')
    ) {
      event.preventDefault()
      event.stopPropagation()
      logsClear()
    }
  },
  true,
)

export function consoleMap(): Console {
  const console = {} as Console

  for (const method in global.console) {
    const logFn = logger.bind(method)
    console[method] =
      method === 'warn'
        ? (...args) => {
            const [message] = args
            if (
              typeof message === 'string' &&
              message.includes('multiple instances of Solid')
            )
              return
            logFn(...args)
          }
        : logFn
  }
  console.assert = (condition, ...args) => {
    if (!condition) {
      /* chrome behavior */
      if (args.length === 0) args = ['console.assert']
      /*
        console substitutions like %s
        works only in first argument of console.error
      */
      if (typeof args[0] === 'string') {
        console.error(`Assertion failed: ${args[0]}`, ...args.slice(1))
      } else {
        console.error('Assertion failed:', ...args)
      }
    }
  }
  return console
}

function logger(this: any, ...args: any[]) {
  const method = this.toString()
  logHappened({method, args})
}

let nextLogId = 0
function parseLog({method, args}: {method: Method; args: any[]}): Log {
  const id = ++nextLogId

  switch (method) {
    case 'error': {
      const errors = args.map(extractStack)
      return {method, id, data: errors}
    }
    default: {
      return {method, id, data: args}
    }
  }
}

function extractStack(error: Error | any): any {
  try {
    return error.stack || error
  } catch (_) {
    return error
  }
}
