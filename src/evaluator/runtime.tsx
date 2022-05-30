import {
  availablePlugins,
  availablePresets,
  registerPlugin,
  registerPreset,
  transform,
} from '@babel/standalone'

export type BabelPlugin = string | [string, any]

function writeStuckFlag(stuck: boolean) {
  try {
    localStorage.setItem('runtime/stuck', JSON.stringify(stuck))
  } catch (err) {}
}

export interface BabelPluginOptions {
  addNames?: boolean
  debugSids?: boolean
  factories?: string[]
  importName?: string
  reactSsr?: boolean
}

export async function exec({
  realmGlobal,
  code,
  globalBlocks = [],
  types = 'typescript',
  preset = 'react',
  filename = 'repl',
  pluginRegistry = {},
  presetRegistry = {},
  babelPluginOptions = {},
  compile = true,
  onCompileError,
  onRuntimeError,
  onCompileComplete,
  onRuntimeComplete,
}: {
  realmGlobal: any
  code: string
  globalBlocks?: Object[]
  types?: 'flow' | 'typescript'
  preset?: string
  filename?: string
  pluginRegistry?: {[name: string]: any}
  presetRegistry?: {[name: string]: any}
  babelPluginOptions?: BabelPluginOptions
  compile?: boolean
  onCompileError?: (error: any) => any
  onRuntimeError?: (error: any) => any
  onCompileComplete?: (code: string, babelConfig: any) => any
  onRuntimeComplete?: () => any
}) {
  const globalFull = Object.assign({}, ...[...globalBlocks].reverse())
  Object.assign(realmGlobal, globalFull)
  let compiled = code
  if (compile) {
    for (const key in pluginRegistry) {
      delete availablePlugins[key]
      registerPlugin(key, pluginRegistry[key])
    }
    for (const key in presetRegistry) {
      delete availablePresets[key]
      registerPreset(key, presetRegistry[key])
    }
    const babelOptions = generateBabelConfig({
      types,
      filename,
      babelPluginOptions,
      preset,
    })
    try {
      compiled = transformCode(code, babelOptions)
      if (onCompileComplete) await onCompileComplete(compiled, babelOptions)
    } catch (error) {
      if (onCompileError) await onCompileError(error)
      throw error
    }
  }
  try {
    const result = await realmGlobal.eval(compiled)
    if (onRuntimeComplete) await onRuntimeComplete()
    return result
  } catch (error) {
    if (onRuntimeError) await onRuntimeError(error)
    throw error
  } finally {
    writeStuckFlag(false)
  }
}

function transformCode(code: string, babelOptions): string {
  const detail = transform(code, babelOptions)
  const compiled = detail.code
  if (!window['addons']) {
    window['addons'] = {}
  }
  // window['addons'] ||= {}
  window['addons'].transformation = detail
  window.dispatchEvent(new CustomEvent('@babel/transform', {detail}))
  const wrappedCode = `async function main() {
${compiled}

}
main()
//# sourceURL=${babelOptions.filename}`
  return wrappedCode
}

export function generateBabelConfig({
  types,
  filename,
  babelPluginOptions,
  preset = 'react',
}: {
  types: 'typescript' | 'flow' | null
  filename: string
  babelPluginOptions: BabelPluginOptions
  preset?: string
}) {
  const presets: BabelPlugin[] = preset === 'react' ? ['react'] : ['solid'] // TODO: add 'patronum/babel-preset'
  const plugins: BabelPlugin[] = [
    'transform-strict-mode',
    'syntax-bigint',
    'proposal-numeric-separator',
    'proposal-nullish-coalescing-operator',
    'proposal-optional-chaining',
    ['proposal-class-properties', {loose: true}],
    [
      'effector/babel-plugin',
      {
        addLoc: true,
        ...babelPluginOptions,
      },
    ],
    '@effector/repl-remove-imports',
  ]
  if (!/\.[jt]sx?$/.test(filename)) {
    filename = `${filename}.${types === 'typescript' ? 't' : 'j'}s`
  }
  switch (types) {
    case 'flow':
      presets.push(['flow', {all: true}])
      break
    case 'typescript':
      presets.push([
        'typescript',
        {
          isTSX: true,
          allExtensions: true,
        },
      ])
      break
  }
  return {
    filename,
    sourceFileName: filename,
    presets,
    parserOpts: {
      allowAwaitOutsideFunction: true,
      ranges: true,
      tokens: true,
    },
    generatorOpts: {
      shouldPrintComment: () => true,
    },
    plugins,
    sourceMaps: 'inline',
    ast: true,
  }
}
