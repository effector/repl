// @ts-nocheck
import React from 'react'
import PropTypes from 'prop-types'

import {styleSet} from '../styles'

const styles = styleSet.TreeNode

const DEFAULT_ROOT_PATH = '$'
const WILDCARD = '*'

function hasChildNodes(data, dataIterator) {
  return !dataIterator(data).next().done
}

const wildcardPathsFromLevel = (level: number = 0) => {
  // i is depth
  return Array.from({length: level}, (_, i) =>
    [DEFAULT_ROOT_PATH].concat(Array.from({length: i}, () => '*')).join('.'),
  )
}

const getExpandedPaths = (
  data: any,
  dataIterator,
  expandPaths: string | string[],
  expandLevel: number,
  initialState: object = {},
) => {
  let wildcardPaths = ([] as string[])
    .concat(wildcardPathsFromLevel(expandLevel))
    .concat(expandPaths)
    .filter(path => typeof path === 'string') // could be undefined

  const expandedPaths = [] as string[]
  wildcardPaths.forEach(wildcardPath => {
    const keyPaths = wildcardPath.split('.')
    const populatePaths = (curData: any, curPath: string, depth: number) => {
      if (depth === keyPaths.length) {
        expandedPaths.push(curPath)
        return
      }
      const key = keyPaths[depth]
      if (depth === 0) {
        if (
          hasChildNodes(curData, dataIterator) &&
          (key === DEFAULT_ROOT_PATH || key === WILDCARD)
        ) {
          populatePaths(curData, DEFAULT_ROOT_PATH, depth + 1)
        }
      } else {
        if (key === WILDCARD) {
          for (let {name, data} of dataIterator(curData)) {
            if (hasChildNodes(data, dataIterator)) {
              populatePaths(data, `${curPath}.${name}`, depth + 1)
            }
          }
        } else {
          const value = curData[key]
          if (hasChildNodes(value, dataIterator)) {
            populatePaths(value, `${curPath}.${key}`, depth + 1)
          }
        }
      }
    }

    populatePaths(data, '', 0)
  })

  return expandedPaths.reduce((obj, path) => {
    obj[path] = true
    return obj
  }, initialState)
}

const arrowStyles = {
  expanded: {
    ...styles.treeNodeArrow.base,
    ...styles.treeNodeArrow.expanded,
  },
  collapsed: {
    ...styles.treeNodeArrow.base,
    ...styles.treeNodeArrow.collapsed,
  },
}

const defaultNodeRenderer = ({name}: {name?: string}) => <span>{name}</span>

class TreeNode extends React.Component<{
  name?: string
  data?: any
  expanded?: boolean
  nodeRenderer: React.FC<any>
  onClick?: (e: any) => any
  shouldShowArrow?: boolean
  shouldShowPlaceholder?: boolean
  title?: string
}> {
  render() {
    const {
      expanded = true,
      onClick = () => {},
      children,
      nodeRenderer = defaultNodeRenderer,
      title,
      shouldShowArrow = false,
      shouldShowPlaceholder = true,
    } = this.props

    const renderedNode = React.createElement(nodeRenderer, {
      ...this.props,
      //@ts-ignore
      expanded,
      onClick,
      children,
      nodeRenderer,
      title,
      shouldShowArrow,
      shouldShowPlaceholder,
    })
    const childNodes = expanded ? children : undefined

    return (
      <li
        aria-expanded={expanded}
        role="treeitem"
        style={styles.treeNodeBase}
        title={title}>
        <div style={styles.treeNodePreviewContainer} onClick={onClick}>
          {shouldShowArrow || React.Children.count(children) > 0 ? (
            <span
              style={expanded ? arrowStyles.expanded : arrowStyles.collapsed}>
              ▶
            </span>
          ) : (
            shouldShowPlaceholder && (
              <span style={styles.treeNodePlaceholder}>&nbsp;</span>
            )
          )}
          {renderedNode}
        </div>

        <ol role="group" style={styles.treeNodeChildNodesContainer}>
          {childNodes}
        </ol>
      </li>
    )
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_EXPAND': {
      const path = action.path
      const expandedPaths = state.expandedPaths
      const expanded = !!expandedPaths[path]

      return Object.assign({}, state, {
        expandedPaths: Object.assign({}, state.expandedPaths, {
          [path]: !expanded,
        }),
      })
    }
    default:
      return state
  }
}

class ConnectedTreeNode extends React.Component<{
  name?: string
  data?: any
  expanded?: boolean
  dataIterator: Function
  nodeRenderer: React.FC<any>
  depth: number
  path: string
}> {
  static contextTypes = {
    store: PropTypes.any,
  }
  constructor(props, context) {
    super(props)

    this.state = context.store.storeState
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !!nextState.expandedPaths[nextProps.path] !==
        !!this.state.expandedPaths[this.props.path] ||
      nextProps.data !== this.props.data ||
      nextProps.name !== this.props.name
    )
  }

  handleClick(path) {
    this.context.store.storeState = reducer(this.context.store.storeState, {
      type: 'TOGGLE_EXPAND',
      path: path,
    })
    this.setState(this.context.store.storeState)
  }

  render() {
    const {data, dataIterator, path, depth, nodeRenderer} = this.props
    const {expandedPaths} = this.state

    const nodeHasChildNodes = hasChildNodes(data, dataIterator)
    const expanded = !!expandedPaths[path]
    /** only render if the node is expanded */
    let childNodes: JSX.Element[]
    if (expanded) {
      childNodes = []
      for (const {name, data: childData, ...props} of dataIterator(data)) {
        childNodes.push(
          <ConnectedTreeNode
            name={name}
            data={childData}
            depth={depth + 1}
            path={`${path}.${name}`}
            key={name}
            dataIterator={dataIterator}
            nodeRenderer={nodeRenderer}
            {...props} // props for nodeRenderer
          />,
        )
      }
    }
    return (
      <TreeNode
        expanded={expanded}
        onClick={
          nodeHasChildNodes ? this.handleClick.bind(this, path) : () => {}
        }
        // show arrow anyway even if not expanded and not rendering children
        shouldShowArrow={nodeHasChildNodes}
        // show placeholder only for non root nodes
        shouldShowPlaceholder={depth > 0}
        // Render a node from name and data (or possibly other props like isNonenumerable)
        {...this.props}>
        {childNodes!}
      </TreeNode>
    )
  }
}

export class TreeView extends React.Component<{
  expandLevel?: number
  name?: string
  data?: any
  expandPaths?: string | string[]
  dataIterator: Function
  nodeRenderer: React.FC<any>
}> {
  static defaultProps = {
    expandLevel: 0,
    expandPaths: [],
  }
  static childContextTypes = {
    store: PropTypes.any,
  }
  store: {storeState: {expandedPaths: any}}
  constructor(props) {
    super(props)

    this.store = {
      storeState: {
        expandedPaths: getExpandedPaths(
          props.data,
          props.dataIterator,
          props.expandPaths,
          props.expandLevel,
        ),
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    this.store = {
      storeState: {
        expandedPaths: getExpandedPaths(
          nextProps.data,
          nextProps.dataIterator,
          nextProps.expandPaths,
          nextProps.expandLevel,
          this.store.storeState.expandedPaths,
        ),
      },
    }
  }

  getChildContext() {
    return {
      store: this.store,
    }
  }

  render() {
    const {name, data, dataIterator, nodeRenderer} = this.props
    return (
      <ConnectedTreeNode
        name={name}
        data={data}
        dataIterator={dataIterator}
        depth={0}
        path={DEFAULT_ROOT_PATH}
        nodeRenderer={nodeRenderer}
      />
    )
  }
}
