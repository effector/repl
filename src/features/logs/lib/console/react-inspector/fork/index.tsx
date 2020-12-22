import React from 'react'

export {default as DOMInspector} from './dom-inspector/DOMInspector'
export {default as ObjectLabel} from './object-inspector/ObjectLabel'
export {default as ObjectRootLabel} from './object-inspector/ObjectRootLabel'

import {ObjectInspector} from './object-inspector/ObjectInspector'
import {TableInspector} from './TableInspector'
import DOMInspector from './dom-inspector/DOMInspector'

export const Inspector = ({
  table = false,
  data,
  ...rest
}: {
  table?: boolean
  name?: string
  data: any
  nodeRenderer?: React.FC<any>
}) => {
  if (table) {
    return <TableInspector data={data} {...rest} />
  }

  if (isDOM(data)) return <DOMInspector data={data} {...rest} />

  return <ObjectInspector data={data} {...rest} />
}

function isDOM(val) {
  if (typeof val !== 'object' || val === null) return false
  return typeof val.nodeType === 'number' && typeof val.nodeName === 'string'
}
