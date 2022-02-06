import {styled} from 'linaria/react'
import React from 'react'

import {styleSet} from '../styles'
import {TreeView} from './TreeView'

const createIterator = (
  showNonenumerable: boolean,
  sortObjectKeys?: boolean | ((a: string, b: string) => 1 | 0 | -1),
) =>
  function* (data) {
    const shouldIterate =
      (typeof data === 'object' && data !== null) || typeof data === 'function'
    if (!shouldIterate) return

    const dataIsArray = Array.isArray(data)

    // iterable objects (except arrays)
    if (!dataIsArray && data[Symbol.iterator]) {
      let i = 0
      for (let entry of data) {
        if (Array.isArray(entry) && entry.length === 2) {
          const [k, v] = entry
          yield {
            name: k,
            data: v,
          }
        } else {
          yield {
            name: i.toString(),
            data: entry,
          }
        }
        i++
      }
    } else {
      const keys = Object.getOwnPropertyNames(data)
      if (sortObjectKeys === true && !dataIsArray) {
        // Array keys should not be sorted in alphabetical order
        keys.sort()
      } else if (typeof sortObjectKeys === 'function') {
        keys.sort(sortObjectKeys)
      }

      for (let propertyName of keys) {
        if (Object.prototype.propertyIsEnumerable.call(data, propertyName)) {
          const propertyValue = data[propertyName]
          yield {
            name: propertyName || `""`,
            data: propertyValue,
          }
        } else if (showNonenumerable) {
          // To work around the error (happens some time when propertyName === 'caller' || propertyName === 'arguments')
          // 'caller' and 'arguments' are restricted function properties and cannot be accessed in this context
          // http://stackoverflow.com/questions/31921189/caller-and-arguments-are-restricted-function-properties-and-cannot-be-access
          let propertyValue
          try {
            propertyValue = data[propertyName]
          } catch (e) {
            // console.warn(e)
          }

          if (propertyValue !== undefined) {
            yield {
              name: propertyName,
              data: propertyValue,
              isNonenumerable: true,
            }
          }
        }
      }

      // [[Prototype]] of the object: `Object.getPrototypeOf(data)`
      // the property name is shown as "__proto__"
      if (showNonenumerable && data !== Object.prototype /* already added */) {
        yield {
          name: '__proto__',
          data: Object.getPrototypeOf(data),
          isNonenumerable: true,
        }
      }
    }
  }

const defaultNodeRenderer = ({depth, name, data, isNonenumerable}) =>
  depth === 0 ? (
    <ObjectRootLabel name={name} data={data} />
  ) : (
    <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
  )

/**
 * Tree-view for objects
 */
export function ObjectInspector({
  showNonenumerable = false,
  sortObjectKeys,
  nodeRenderer = defaultNodeRenderer,
  ...rest
}: {
  /** An integer specifying to which level the tree should be initially expanded. */
  expandLevel?: number
  /** An array containing all the paths that should be expanded when the component is initialized, or a string of just one path */
  expandPaths?: string | string[]
  name?: string
  /** Not required prop because we also allow undefined value */
  data?: any
  /** Show non-enumerable properties */
  showNonenumerable?: boolean
  /** Sort object keys with optional compare function. */
  sortObjectKeys?: boolean | ((a: string, b: string) => 1 | 0 | -1)
  /** Provide a custom nodeRenderer */
  nodeRenderer?: React.FC<any>
}) {
  return (
    <TreeView
      nodeRenderer={nodeRenderer}
      dataIterator={createIterator(showNonenumerable, sortObjectKeys)}
      {...{...rest, showNonenumerable}}
    />
  )
}

export const ObjectRootLabel = ({name, data}: {name?: string; data: any}) => {
  if (typeof name === 'string') {
    return (
      <span>
        <ObjectName name={name} />
        <span>: </span>
        <ObjectPreview data={data} />
      </span>
    )
  }
  return <ObjectPreview data={data} />
}

const ObjectPreviewElement = styled.span`
  font-style: italic;
`

/* intersperse arr with separator */
function intersperse(arr: any[], sep: string) {
  if (arr.length === 0) {
    return []
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]])
}

function printDate(date) {
  let string = date.toString()
  if ('toLocaleString' in date) {
    string = date.toLocaleString()
  }
  return string
}

/**
 * A preview of the object
 */
export const ObjectPreview = ({
  data,
  maxProperties = 5,
}: {
  data: any
  maxProperties?: number
}) => {
  const object = data

  if (inheritsOf(object, Date)) {
    return (
      <span>
        <ObjectName name="Date" />
        &nbsp;{printDate(object)}
      </span>
    )
  }

  if (inheritsOf(object, RegExp)) {
    return (
      <span>
        <ObjectName name="RegExp" />
        &nbsp;{object.toString()}
      </span>
    )
  }

  if (typeof object !== 'object' || object === null) {
    return <ObjectValue object={object} />
  }

  // Cannot check using instanceof Error
  if (
    typeof object === 'object' &&
    typeof object.stack === 'string' &&
    typeof object.message === 'string'
  ) {
    return <ObjectPreviewElement>{`${object.stack}`}</ObjectPreviewElement>
  }

  if (Array.isArray(object)) {
    return (
      <ObjectPreviewElement>
        [
        {intersperse(
          object.map((element, index) => (
            <ObjectValue key={index} object={element} />
          )),
          ', ',
        )}
        ]
      </ObjectPreviewElement>
    )
  } else {
    const propertyNodes = [] as JSX.Element[]
    if (inheritsOf(object, Set)) {
      if (object.size > 0) {
        for (let [key, item] of object.entries()) {
          propertyNodes.push(
            <span key={key}>
              <ObjectValue object={item} />
            </span>,
          )
        }
      }
    }
    if (inheritsOf(object, Map)) {
      if (object.size > 0) {
        for (let [key, item] of object.entries()) {
          propertyNodes.push(
            <span key={key}>
              <ObjectName name={key} />
              &nbsp;={'>'}&nbsp;
              <ObjectValue object={item} />
            </span>,
          )
        }
      }
    }
    for (let propertyName in object) {
      const propertyValue = object[propertyName]
      if (Object.prototype.hasOwnProperty.call(object, propertyName)) {
        let ellipsis
        if (
          propertyNodes.length === maxProperties - 1 &&
          Object.keys(object).length > maxProperties
        ) {
          ellipsis = <span key={'ellipsis'}>…</span>
        }
        propertyNodes.push(
          <span key={propertyName}>
            <ObjectName name={propertyName || `""`} />
            :&nbsp;
            <ObjectValue object={propertyValue} />
            {ellipsis}
          </span>,
        )
        if (ellipsis) break
      }
    }

    return (
      <ObjectPreviewElement>
        {`${object[Symbol.toStringTag] || ''} {`}
        {intersperse(propertyNodes, ', ')}
        {'}'}
      </ObjectPreviewElement>
    )
  }
}

/**
 * if isNonenumerable is specified, render the name dimmed
 */
export const ObjectLabel = ({
  name,
  data,
  isNonenumerable,
}: {
  name: string
  data: any
  isNonenumerable: boolean
}) => {
  const object = data

  return (
    <span>
      <ObjectName name={name} dimmed={isNonenumerable} />
      <span>: </span>
      <ObjectValue object={object} />
    </span>
  )
}

function inheritsOf(source: any, target: any): boolean {
  // We need to check instance name because while using different realms instances is different
  return source instanceof target || source.constructor.name === target.name
}

/**
 * A view for object property names.
 *
 * If the property name is enumerable (in Object.keys(object)),
 * the property name will be rendered normally.
 *
 * If the property name is not enumerable (`Object.prototype.propertyIsEnumerable()`),
 * the property name will be dimmed to show the difference.
 */
export const ObjectName = ({
  name,
  dimmed = false,
}: {
  name: string
  dimmed?: boolean
}) => {
  const styles = styleSet.ObjectName
  return <span className={dimmed ? styles.dimmed : styles.base}>{name}</span>
}

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
      if (inheritsOf(object, Date)) {
        return (
          <span>
            <ObjectName name="Date" />
            &nbsp;{printDate(object)}
          </span>
        )
      }
      if (inheritsOf(object, RegExp)) {
        return (
          <span className={styles.objectValueRegExp}>
            <ObjectName name="RegExp" />
            &nbsp;{object.toString()}
          </span>
        )
      }
      if (Array.isArray(object)) {
        return <span>{`Array[${object.length}]`}</span>
      }
      if (!object.constructor || inheritsOf(object, Object)) {
        return <span>{`Object {${Object.keys(object).length}}`}</span>
      }
      if (
        typeof object.constructor.isBuffer === 'function' &&
        object.constructor.isBuffer(object)
      ) {
        return <span>{`Buffer[${object.length}]`}</span>
      }

      if (inheritsOf(object, Map)) {
        return <span>{`Map[${object.size}]`}</span>
      }
      if (inheritsOf(object, Set)) {
        return <span>{`Set[${object.size}]`}</span>
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
      return <span>{typeof object}</span>
  }
}
