import React from 'react'

import DOMNodePreview from './DOMNodePreview'
import {TreeView} from '../TreeView'

import shouldInline from './shouldInline'
const domIterator = function* (data) {
  if (data && data.childNodes) {
    const textInlined = shouldInline(data)

    if (textInlined) {
      return
    }

    for (let i = 0; i < data.childNodes.length; i++) {
      const node = data.childNodes[i]

      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim().length === 0
      )
        continue

      yield {
        name: `${node.tagName}[${i}]`,
        data: node,
      }
    }

    // at least 1 child node
    if (data.tagName) {
      yield {
        name: 'CLOSE_TAG',
        data: {
          tagName: data.tagName,
        },
        isCloseTag: true,
      }
    }
  }
}

export default function DOMInspector(props) {
  return (
    <TreeView
      nodeRenderer={DOMNodePreview}
      dataIterator={domIterator}
      {...props}
    />
  )
}
