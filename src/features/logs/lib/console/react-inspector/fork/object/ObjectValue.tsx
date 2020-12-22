import React from 'react'

import {styleSet} from '../../styles'

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
export const ObjectValue = ({object}: {object: any}) => {
  const styles = styleSet.ObjectValue
  switch (typeof object) {
    case 'number':
      return <span className={styles.objectValueNumber}>{String(object)}</span>
    case 'string':
      return <span className={styles.objectValueString}>"{object}"</span>
    case 'boolean':
      return <span className={styles.objectValueBoolean}>{String(object)}</span>
    case 'undefined':
      return <span className={styles.objectValueUndefined}>undefined</span>
    case 'object':
      if (object === null) {
        return <span className={styles.objectValueNull}>null</span>
      }
      if (object instanceof Date) {
        return <span>{object.toString()}</span>
      }
      if (object instanceof RegExp) {
        return (
          <span className={styles.objectValueRegExp}>{object.toString()}</span>
        )
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
          <span className={styles.objectValueFunctionKeyword}>function</span>
          <span className={styles.objectValueFunctionName}>
            &nbsp;{object.name}()
          </span>
        </span>
      )
    case 'symbol':
      return (
        <span className={styles.objectValueSymbol}>{object.toString()}</span>
      )
    default:
      return <span />
  }
}
