import React from 'react'
import {Inspector} from './fork'
import {
  ObjectLabel,
  ObjectRootLabel,
  ObjectName,
  ObjectPreview,
} from './fork/ObjectInspector'
import {DOMInspector} from './fork/DOMInspector'

import {Methods} from '../methods'
import {Constructor, HTML, Root, Table} from './elements'

export class CustomInspector extends React.PureComponent<
  {
    method: Methods
    data: any
  },
  any
> {
  render() {
    const {method, data} = this.props

    const dom = data instanceof HTMLElement
    const table = method === 'table'

    return (
      <Root data-type={table ? 'table' : dom ? 'html' : 'object'}>
        {table ? (
          <Table>
            <Inspector {...this.props} table />
            <Inspector {...this.props} />
          </Table>
        ) : dom ? (
          <HTML>
            <DOMInspector {...this.props} />
          </HTML>
        ) : (
          <Inspector
            {...this.props}
            nodeRenderer={this.nodeRenderer.bind(this)}
          />
        )}
      </Root>
    )
  }

  getCustomNode(data: any) {
    const constructor = data && data.constructor ? data.constructor.name : null

    if (constructor === 'Function')
      return (
        <span style={{fontStyle: 'italic'}}>
          <ObjectPreview data={data} />
          {` {`}
          <span style={{color: 'rgb(181, 181, 181)'}}>{data.body}</span>
          {`}`}
        </span>
      )

    if (constructor === 'Promise')
      return (
        <span style={{fontStyle: 'italic'}}>
          Promise {`{`}
          <span style={{opacity: 0.6}}>{`<pending>`}</span>
          {`}`}
        </span>
      )

    if (data instanceof HTMLElement)
      return (
        <HTML>
          <DOMInspector data={data} />
        </HTML>
      )
    return null
  }

  nodeRenderer(props: any) {
    const {depth, name, data, isNonenumerable} = props

    // Root
    if (depth === 0) {
      const customNode = this.getCustomNode(data)
      return customNode || <ObjectRootLabel name={name} data={data} />
    }

    if (name === 'constructor')
      return (
        <Constructor>
          <ObjectLabel
            name="<constructor>"
            data={data.name}
            isNonenumerable={isNonenumerable}
          />
        </Constructor>
      )

    const customNode = this.getCustomNode(data)
    return customNode ? (
      <Root>
        <ObjectName name={name} />
        <span>: </span>
        {customNode}
      </Root>
    ) : (
      <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
    )
  }
}
