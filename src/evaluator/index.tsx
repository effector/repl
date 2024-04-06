import babelPresetSolid from 'babel-preset-solid'
import CodeMirror from 'codemirror'
import {combine, createEffect, sample} from 'effector'
import PluginEffectorReact from 'effector/babel-plugin-react'
import * as pathLibrary from 'path'
import React from 'react'
import * as ReactDOM from 'react-dom'

import * as babel from '@babel/core'
import PluginBigInt from '@babel/plugin-syntax-bigint'
import {availablePlugins} from '@babel/standalone'

import {selectVersion, selectViewLib} from '../editor'
import {$compiledCode, $sourceCode, $version} from '../editor/state'
import {codeMirror} from '../editor/view'
// TODO: remove exact dependency on feature, use requirements in the future
import {consoleMap} from '../features/logs'
import {realmListener, realmRemoveListener, realmStatusApi} from '../realm'
import {$babelPluginSettings, $typechecker, $viewLib} from '../settings/state'
import {prepareRuntime} from './prepareRuntime'
import {BabelPlugin, exec, generateBabelConfig} from './runtime'
import {getStackFrames} from './stackframe/getStackFrames'

const tag = `# source`

async function getLibraryCode(
  filename: string,
  url: string,
  additionalLibs = {},
) {
  const req = await fetch(url)
  let text = await req.text()
  text.replace(/\/\/\# sourceMappingURL\=.*$/m, `//${tag}MappingURL=${url}.map`)
  return createRealm(text, filename, additionalLibs)
}
const filename = combine($typechecker, (typechecker): string => {
  if (typechecker === 'typescript') return 'repl.ts'
  return 'repl.js'
})

async function createRealm(sourceCode: string, filename, additionalLibs = {}) {
  const realm = {} as any
  realm.process = {env: {NODE_ENV: 'development'}}
  realm.require = path => {
    switch (path) {
      case 'symbol-observable':
        return (Symbol as any).observable || '@@observable'
      case 'path':
        return pathLibrary
      case 'react':
        return React
    }
    if (path in additionalLibs) return additionalLibs[path]
    console.warn('require: ', path)
  }
  realm.exports = {}
  realm.module = {exports: realm.exports}
  realm.console = consoleMap()
  await exec({
    code: `'use strict'; ${sourceCode}\n//${tag}URL=${filename}`,
    realmGlobal: getIframe().contentWindow,
    globalBlocks: [realm],
    onRuntimeError,
    compile: false,
    filename,
  })
  return realm.module.exports || realm.exports
}

const cache = {
  effector: new Map(),
  '@effector/babel-plugin': new Map(),
}

const fetchEffector = createEffect('fetch effector', {
  async handler(ver: string) {
    const url =
      ver === 'master'
        ? 'https://effector--canary.s3-eu-west-1.amazonaws.com/effector/effector.cjs.js'
        : `https://unpkg.com/effector@${ver}/effector.cjs.js`
    return getLibraryCode(`effector.${ver}.js`, url)
  },
})

sample({clock: fetchEffector.fail, fn: () => 'master', target: selectVersion})

const fetchBabelPlugin = createEffect<string, {[key: string]: any}, any>({
  async handler(ver) {
    let url: string
    if (ver === 'master') {
      url =
        'https://effector--canary.s3-eu-west-1.amazonaws.com/effector/babel-plugin.js'
    } else {
      let [major, minor = '', patch = ''] = ver.split('.')
      patch = patch.split('-')[0]
      if (
        major === '0' &&
        (parseInt(minor) < 18 || (minor === '18' && parseInt(patch) < 7))
      ) {
        url = `https://unpkg.com/@effector/babel-plugin@latest/index.js`
      } else {
        url = `https://unpkg.com/effector@${ver}/babel-plugin.js`
      }
    }
    return getLibraryCode(`effector-babel-plugin.${ver}.js`, url)
  },
})

const fetchEffectorInspect = createEffect(
  async ({effector, ver}: {effector: any; ver: string}) => {
    const url =
      ver === 'master'
        ? 'https://effector--canary.s3-eu-west-1.amazonaws.com/effector/inspect.js'
        : `https://unpkg.com/effector@${ver}/inspect.js`

    return getLibraryCode(`effector.${ver}.js`, url, {effector})
  },
)

function getShimDefinition(shim: any) {
  const result = {}
  result['use-sync-external-store/shim/index.js'] = shim
  result['use-sync-external-store/shim'] = shim
  return result
}

function getShiSelectorDefinition(shimSelector: any) {
  const result = {}
  result['use-sync-external-store/shim/with-selector.js'] = shimSelector
  result['use-sync-external-store/shim/with-selector'] = shimSelector
  return result
}

const fetchEffectorSolid = createEffect<any, {[key: string]: any}, any>({
  async handler(effector) {
    const effectorSolidUrl =
      'https://effector--canary.s3-eu-west-1.amazonaws.com/effector-solid/effector-solid.cjs.js'
    const solidJsUrl = 'https://unpkg.com/solid-js/dist/dev.cjs'
    const solidJsWebUrl = 'https://unpkg.com/solid-js/web/dist/dev.cjs'

    const solidJs = await getLibraryCode('solid-js', solidJsUrl)
    const solidJsWeb = await getLibraryCode('solid-js/web', solidJsWebUrl, {
      'solid-js': solidJs,
    })

    const effectorSolid = await getLibraryCode(
      `effector-solid.cjs.js`,
      effectorSolidUrl,
      {
        effector,
        'solid-js': solidJs,
        'solid-js/web': solidJsWeb,
      },
    )

    return {
      effectorSolid,
      solidJs,
      solidJsWeb,
    }
  },
})

const fetchEffectorReact = createEffect<any, {[key: string]: any}, any>({
  async handler(effector) {
    const effectorReactUrl =
      'https://effector--canary.s3-eu-west-1.amazonaws.com/effector-react/effector-react.cjs.js'
    const shimUrl =
      'https://unpkg.com/use-sync-external-store/cjs/use-sync-external-store-shim.production.min.js'
    const withSelectorUrl =
      'https://unpkg.com/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.min.js'
    const shimName = 'use-sync-external-store/shim/index.js'
    const shimSelectorName = 'use-sync-external-store/shim/with-selector.js'
    const shim = await getLibraryCode(shimName, shimUrl)
    const withSelector = await getLibraryCode(
      shimSelectorName,
      withSelectorUrl,
      getShimDefinition(shim),
    )
    const effectorReact = await getLibraryCode(
      `effector-react.cjs.js`,
      effectorReactUrl,
      {
        effector,
        ...getShimDefinition(shim),
        ...getShiSelectorDefinition(withSelector),
      },
    )
    return {effectorReact, shim, withSelector}
  },
})

const fetchForest = createEffect({
  async handler(effector) {
    const url =
      'https://effector--canary.s3-eu-west-1.amazonaws.com/forest/forest.cjs.js'
    return getLibraryCode(`forest.cjs.js`, url, {effector})
  },
})

const fetchEffectorReactSSR = createEffect({
  async handler(deps) {
    const url =
      'https://effector--canary.s3-eu-west-1.amazonaws.com/effector-react/scope.js'
    return getLibraryCode(`scope.js`, url, deps)
  },
})

const fetchEffectorSolidSSR = createEffect({
  async handler(deps) {
    const url =
      'https://effector--canary.s3-eu-west-1.amazonaws.com/effector-solid/scope.js'
    return getLibraryCode(`scope.js`, url, deps)
  },
})

const fetchPatronum = createEffect({
  async handler(effector) {
    const url = 'https://unpkg.com/patronum/patronum.cjs'
    return getLibraryCode(`patronum.js`, url, {effector})
  },
})

fetchBabelPlugin.fail.watch(() => selectVersion('master'))

const api = {
  effector: fetchEffector,
  '@effector/babel-plugin': fetchBabelPlugin,
  forest: fetchForest,
}

function cacher(v, cache, fetcher) {
  const cached = cache.get(v)
  if (cached) return cached
  const req = fetcher(v)
  cache.set(v, req)
  return req
}

export const versionLoader = $version.map(v => {
  const data = {}
  for (const key in cache) {
    data[key] = cacher(v, cache[key], api[key])
  }
  return data
})

export async function evaluator(code: string) {
  realmStatusApi.init()
  const [babelPlugin, effector] = await Promise.all([
    cache['@effector/babel-plugin'].get($version.getState()),
    cache.effector.get($version.getState()),
  ])
  const effectorInspect = await fetchEffectorInspect({
    effector,
    ver: $version.getState(),
  })
  const babelPluginOptions = $babelPluginSettings.getState()
  const {effectorReact, shim, withSelector} = await fetchEffectorReact(effector)
  const {effectorSolid, solidJs, solidJsWeb} = await fetchEffectorSolid(
    effector,
  )
  let forest
  let effectorBindingSSR
  let patronum
  if ($version.getState() === 'master') {
    const additionalLibs = await Promise.all([
      fetchForest(effector),
      fetchPatronum(effector),
    ])
    forest = additionalLibs[0]
    patronum = additionalLibs[1]
  } else {
    const isVersionWithScopeModule =
      parseInt($version.getState().slice(0, 2)) <= 22
    if (isVersionWithScopeModule) {
      effectorBindingSSR = await ($viewLib.getState() === 'react'
        ? fetchEffectorReactSSR({
            effector,
            ...getShimDefinition(shim),
            ...getShiSelectorDefinition(withSelector),
          })
        : fetchEffectorSolidSSR({
            effector,
            'solid-js': solidJs,
            'solid-js/web': solidJsWeb,
          }))
    }
  }
  function initViewLib(apiMap, api) {
    let env
    let lib

    switch ($viewLib.getState()) {
      case 'react':
        env = {
          React,
          ReactDOM,
        }
        lib = effectorReact
        apiMap(api, {
          createComponent: effectorReact.createComponent,
        })
        break
      case 'solid':
        lib = effectorSolid
        env = {
          ...solidJsWeb,
          ...solidJs,
          _$template: solidJsWeb.template,
          _$createComponent: solidJsWeb.createComponent,
          _$insert: solidJsWeb.insert,
          _$effect: solidJsWeb.effect,
          _$delegateEvents: solidJsWeb.delegateEvents,
        }
    }

    return {
      lib,
      env,
    }
  }
  const env = prepareRuntime(effector, initViewLib, $version.getState())
  return exec({
    code,
    realmGlobal: getIframe().contentWindow,
    globalBlocks: [
      env,
      {
        dom: forest,
        useSyncExternalStoreLib: {shim, withSelector},
        forest,
        effectorFork: effector,
        effectorInspect,
        effectorBindingSSR,
        patronum,
        CodeMirror,
        cm: codeMirror,
        babel,
        generateBabelConfig: (plugins = []) => {
          const config = generateBabelConfig({
            types: null,
            filename: 'file',
            babelPluginOptions,
            preset: $viewLib.getState(),
          })
          config.plugins = [
            'transform-strict-mode',
            'syntax-bigint',
            'proposal-numeric-separator',
            'proposal-nullish-coalescing-operator',
            'proposal-optional-chaining',
            'effector/babel-plugin-react',
            '@effector/repl-remove-imports',
            [availablePlugins['proposal-class-properties'], {loose: true}],
            [availablePlugins['effector/babel-plugin'], {addLoc: true}],
            availablePlugins['syntax-jsx'],
            ...plugins,
          ].map(plugin =>
            typeof plugin === 'string' ? availablePlugins[plugin] : plugin,
          ) as BabelPlugin[]
          config.presets = []
          return config
        },
        availablePlugins,
      },
    ],
    filename: filename.getState(),
    types: $typechecker.getState() || 'typescript',
    preset: $viewLib.getState() || 'react',
    pluginRegistry: {
      'effector/babel-plugin': babelPlugin,
      'effector/babel-plugin-react': PluginEffectorReact,
      'syntax-bigint': PluginBigInt,
      '@effector/repl-remove-imports': removeImportsPlugin,
    },
    presetRegistry: {
      solid: babelPresetSolid,
    },
    babelPluginOptions,
    onCompileError(error) {
      realmStatusApi.fail()
      console.error('Babel ERR', error)
      throw {type: 'babel-error', original: error, stackFrames: []}
    },
    onRuntimeError,
    onCompileComplete(compiled, config) {
      ;($compiledCode as any).setState(compiled)
    },
    onRuntimeComplete() {
      realmStatusApi.done()
    },
  })
}

const onRuntimeError = async error => {
  realmStatusApi.fail()
  console.error('Runtime ERR', error)
  const stackFrames = await getStackFrames(error)
  throw {type: 'runtime-error', original: error, stackFrames}
}

function replaceModuleImports(globalVarName, path, {types: t}) {
  const values: any[] = []
  for (const specifier of path.node.specifiers) {
    switch (specifier.type) {
      case 'ImportSpecifier':
        values.push(
          t.objectProperty(
            t.identifier(specifier.imported.name),
            t.identifier(specifier.local.name),
          ),
        )
        break
      case 'ImportNamespaceSpecifier':
      case 'ImportDefaultSpecifier':
        path.replaceWith(
          t.VariableDeclaration('const', [
            t.VariableDeclarator(
              t.identifier(specifier.local.name),
              t.memberExpression(
                t.identifier('globalThis'),
                t.identifier(globalVarName),
              ),
            ),
          ]),
        )
        return
    }
  }
  path.replaceWith(
    t.VariableDeclaration('const', [
      t.VariableDeclarator(
        t.objectPattern(values),
        t.memberExpression(
          t.identifier('globalThis'),
          t.identifier(globalVarName),
        ),
      ),
    ]),
  )
}

const removeImportsPlugin = babel => ({
  visitor: {
    ImportDeclaration(path) {
      switch (path.node.source.value) {
        case 'forest':
        case 'effector-dom':
          replaceModuleImports('forest', path, babel)
          break
        case 'effector/fork':
          replaceModuleImports('effectorFork', path, babel)
          break
        case 'effector/inspect':
          replaceModuleImports('effectorInspect', path, babel)
          break
        case 'effector-react/scope':
        case 'effector-react/ssr':
          replaceModuleImports('effectorReactSSR', path, babel)
          break
        case 'patronum':
          replaceModuleImports('patronum', path, babel)
          break
        default:
          // TODO: import actual module after patronum refactoring to ES Modules
          if (path.node.source.value.indexOf('patronum/') === 0) {
            replaceModuleImports('patronum', path, babel)
          } else path.remove()
      }
    },
    ExportDefaultDeclaration(path) {
      path.remove()
    },
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        path.replaceWith(path.node.declaration)
      } else {
        path.remove()
      }
    },
  },
})

let iframe: HTMLIFrameElement | null = null

function getIframe(): HTMLIFrameElement {
  if (iframe === null) {
    iframe =
      (document.getElementById('dom') as HTMLIFrameElement) ||
      (document.createElement('iframe') as HTMLIFrameElement)
    const wrapListenerMethods = target => {
      if (!target) return
      if (!target.addEventListener.__original__) {
        const originalMethod = target.addEventListener.bind(target)

        function addEventListener(type, fn, options) {
          originalMethod(type, fn, options)
          realmListener({type, target, fn, options})
        }

        addEventListener.__original__ = originalMethod
        target.addEventListener = addEventListener
      }
      if (!target.removeEventListener.__original__) {
        const originalMethod = target.removeEventListener.bind(target)

        function removeEventListener(type, fn, options) {
          originalMethod(type, fn, options)
          realmRemoveListener({type, target, fn, options})
        }

        removeEventListener.__original__ = originalMethod
        target.removeEventListener = removeEventListener
      }
    }
    const generateFrame = () => {
      if (iframe === null) return
      if (iframe.contentDocument!.body === null) return
      resetHead(iframe.contentDocument)
      iframe.contentDocument!.body.innerHTML =
        '<div class="spectrum spectrum--lightest spectrum--medium" id="root"></div>'
      //wrapListenerMethods(iframe.contentDocument)
      //wrapListenerMethods(iframe.contentWindow)
      //wrapListenerMethods(iframe.contentDocument.body)
      //wrapListenerMethods(iframe.contentDocument.documentElement)
    }
    $sourceCode.watch(generateFrame)
    selectVersion.watch(generateFrame)
    selectViewLib.watch(generateFrame)
  }

  return iframe
}

function resetHead(document) {
  const styleLinks = [
    'https://unpkg.com/@adobe/spectrum-css@2.x/dist/spectrum-core.css',
    'https://unpkg.com/@adobe/spectrum-css@2.x/dist/spectrum-lightest.css',
  ]
  for (const node of document.head.childNodes) {
    if (node.nodeName === 'LINK') {
      const href = node.getAttribute('href')
      const rel = node.getAttribute('rel')
      if (rel === 'stylesheet' && styleLinks.includes(href)) {
        styleLinks.splice(styleLinks.indexOf(href), 1)
        continue
      }
    }
    node.remove()
  }
  for (const url of styleLinks) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', url)
    document.head.appendChild(link)
  }
}
