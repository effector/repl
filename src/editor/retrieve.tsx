import {BabelPluginOptions} from '../evaluator/runtime'
import {setSettings} from '../settings'
import {setCurrentShareId} from '../share'
import defaultVersions from '../versions.json'
import {compress, decompress} from './compression'
import defaultSourceCode from './defaultSourceCode'
import {changeSources, selectVersion} from './index'

function getLocation<T>(defaults: T, fn: (loc: Location) => T): T {
  if (typeof location !== 'undefined') return fn(location)
  return defaults
}

export function retrieveCode(): string | null {
  const isStuck = readStuckFlag()
  const pathname = getLocation('', loc => loc.pathname)
  const origin = getLocation('', loc => loc.origin)
  const href = getLocation('', loc => loc.href)
  const isAuthRedirectedUrl = pathname === '/auth'
  const regExp = new RegExp(`${origin}/(.*)`)
  let slug: string | null = null
  const parsedHref = regExp.exec(href)
  if (parsedHref) slug = parsedHref[1]
  const isProdDomain =
    /https:\/\/(.+\.)?effector\.dev/.test(origin) ||
    /^https:\/\/effector\.now\.sh$/.test(origin)

  if (isProdDomain) {
    if (typeof window !== 'undefined' && '__code__' in window) {
      const preloaded: {
        code: string
        description: string
        tags: string[]
        babelPluginOptions: BabelPluginOptions
        effectorVersion: string
      } = (window as any).__code__
      slug && setCurrentShareId(slug)
      selectVersion(preloaded.effectorVersion)
      setSettings(preloaded.babelPluginOptions)
      return preloaded.code
    }
  } else if (!isAuthRedirectedUrl) {
    if (slug && /^[a-zA-Z0-9]{8}$/.test(slug)) {
      fetch(`https://effector-proxy.now.sh/api/get-code?slug=${slug}`).then(
        async res => {
          try {
            const {status, data} = await res.json()
            if (status === 200) {
              const {code} = JSON.parse(decompress(data)!)
              return changeSources(code)
            }
          } catch (e) {
            console.error(e)
          }
        },
      )
      setCurrentShareId(slug)
      return null
    }
  }

  const code = getUrlParameter('code')
  if (!isAuthRedirectedUrl && code) {
    return decompress(code)!
  }
  if (typeof localStorage !== 'undefined') {
    const sessionExists = Object.keys(sessionStorage || {}).includes(
      'code-compressed',
    )
    const storageCode = (sessionExists ? sessionStorage : localStorage).getItem(
      'code-compressed',
    )
    if (storageCode != null) {
      const decompressed = decompress(storageCode)!
      if (isStuck) {
        const withThrow = `throw Error('this code leads to infinite loop')\n${decompressed}`
        const compressedWithThrow = compress(withThrow)
        localStorage.setItem('code-compressed', compressedWithThrow)
        sessionStorage &&
          sessionStorage.setItem('code-compressed', compressedWithThrow)
        return withThrow
      }
      return decompressed
    }
  }
  return defaultSourceCode
}

function readStuckFlag() {
  if (typeof localStorage !== 'undefined') {
    try {
      let flag = JSON.parse(localStorage.getItem('runtime/stuck')!)
      if (typeof flag !== 'boolean') flag = false
      localStorage.setItem('runtime/stuck', JSON.stringify(false))
      return flag
    } catch (err) {
      return false
    }
  }
  return false
}

export function retrieveVersion(): string {
  const version = getUrlParameter('version')
  if (version) {
    return version
  }
  return defaultVersions[0]
}

function getUrlParameter(name: string): string {
  const search = getLocation('', loc => loc.search)
  if (typeof URLSearchParams !== 'undefined') {
    const urlSearch = new URLSearchParams(search)
    if (urlSearch.has(name)) return urlSearch.get(name)!
  }
  return ''
}
