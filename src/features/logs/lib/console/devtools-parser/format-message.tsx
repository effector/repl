import {format as formatString} from './string-utils'

/**
 * @param {string} format
 * @param {!Array.<!SDK.RemoteObject>} parameters
 * @param {!Element} formattedResult
 */
export function formatWithSubstitutionString(
  format: any,
  parameters: any,
  formattedResult: HTMLSpanElement,
) {
  let currentStyle: any = null

  const formatters = {
    s: (obj: any) => obj,
    f(obj: any) {
      if (typeof obj !== 'number') return 'NaN'
      return obj
    },
    i(obj: any) {
      if (typeof obj !== 'number') return 'NaN'
      return Math.floor(obj)
    },
    d(obj: any) {
      if (typeof obj !== 'number') return 'NaN'
      return Math.floor(obj)
    },
    c(obj: any) {
      currentStyle = {}
      const buffer = document.createElement('span')
      buffer.setAttribute('style', obj)
      for (let i = 0; i < buffer.style.length; i++) {
        const property = buffer.style[i]
        if (isWhitelistedProperty(property))
          currentStyle[property] = buffer.style[property]
      }
    },
    _(obj: any) {
      return obj instanceof Node ? obj : ''
    },
  }

  // String.format does treat formattedResult like a Builder, result is an object.
  return formatString({
    format,
    substitutions: parameters,
    formatters,
    initialValue: formattedResult,
    append: (a: any, b: any) => append(a, b, currentStyle),
  })
}

function append(a: any, b: any, currentStyle: Record<string, string> | null) {
  if (b instanceof Node) {
    a.appendChild(b)
  } else if (typeof b !== 'undefined') {
    let toAppend: any = createAppend(String(b))

    if (currentStyle) {
      const wrapper = document.createElement('span')
      wrapper.appendChild(toAppend)
      applyCurrentStyle(wrapper, currentStyle)
      for (let i = 0; i < wrapper.children.length; ++i)
        applyCurrentStyle(wrapper.children[i], currentStyle)
      toAppend = wrapper
    }
    a.appendChild(toAppend)
  }
  return a
}

function applyCurrentStyle(element: any, currentStyle: Record<string, string>) {
  for (const key in currentStyle) element.style[key] = currentStyle[key]
}

function createAppend(s: string) {
  const container = document.createDocumentFragment()
  container.appendChild(document.createTextNode(s))

  return container
}

function isWhitelistedProperty(property: string) {
  const prefixes = [
    'background',
    'border',
    'color',
    'font',
    'line',
    'margin',
    'padding',
    'text',
    '-webkit-background',
    '-webkit-border',
    '-webkit-font',
    '-webkit-margin',
    '-webkit-padding',
    '-webkit-text',
  ]
  for (let i = 0; i < prefixes.length; i++) {
    if (property.startsWith(prefixes[i])) return true
  }
  return false
}
