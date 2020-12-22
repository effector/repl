import React from 'react'

import {styleSet} from '../../styles'

const styles = styleSet.ObjectValue

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
export const ObjectValue = ({object}: {object: any}) => {
  switch (typeof object) {
    case 'number':
      return <span style={styles.objectValueNumber}>{String(object)}</span>
    case 'string':
      return <span style={styles.objectValueString}>"{object}"</span>
    case 'boolean':
      return <span style={styles.objectValueBoolean}>{String(object)}</span>
    case 'undefined':
      return <span style={styles.objectValueUndefined}>undefined</span>
    case 'object':
      if (object === null) {
        return <span style={styles.objectValueNull}>null</span>
      }
      if (object instanceof Date) {
        return <span>{object.toString()}</span>
      }
      if (object instanceof RegExp) {
        return <span style={styles.objectValueRegExp}>{object.toString()}</span>
      }
      if (Array.isArray(object)) {
        return <span>{`Array[${object.length}]`}</span>
      }
      if (!object.constructor) {
        return <span>Object</span>
      }
      if (
        typeof object.constructor.isBuffer === 'function' &&
        object.constructor.isBuffer(object)
      ) {
        return <span>{`Buffer[${object.length}]`}</span>
      }

      return <span>{object.constructor.name}</span>
    case 'function':
      return (
        <span>
          <span style={styles.objectValueFunctionKeyword}>function</span>
          <span style={styles.objectValueFunctionName}>
            &nbsp;{object.name}()
          </span>
        </span>
      )
    case 'symbol':
      return <span style={styles.objectValueSymbol}>{object.toString()}</span>
    default:
      return <span />
  }
}
