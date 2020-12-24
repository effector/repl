import React from 'react'

import {TreeView} from './TreeView'

import {styleSet} from '../styles'

const TEXT_NODE_MAX_INLINE_CHARS = 80

const shouldInline = data =>
  data.childNodes.length === 0 ||
  (data.childNodes.length === 1 &&
    data.childNodes[0].nodeType === Node.TEXT_NODE &&
    data.textContent.length < TEXT_NODE_MAX_INLINE_CHARS)

const styles = styleSet.DOMNodePreview

const OpenTag = ({
  tagName,
  attributes = [],
}: {
  tagName: string
  attributes?: Array<{name: string; value: string}>
}) => {
  const style = styles.htmlOpenTag
  return (
    <span className={style.base}>
      {'<'}
      <span className={style.tagName}>{tagName}</span>

      {attributes.map((attribute, i) => (
        <span key={i}>
          {' '}
          <span className={style.htmlAttributeName}>{attribute.name}</span>
          {'="'}
          <span className={style.htmlAttributeValue}>{attribute.value}</span>
          {'"'}
        </span>
      ))}

      {'>'}
    </span>
  )
}

const CloseTag = ({
  tagName,
  isChildNode = false,
}: {
  tagName: string
  isChildNode?: boolean
}) => {
  const style = styles.htmlCloseTag
  return (
    <span className={isChildNode ? style.offsetLeft : style.base}>
      {'</'}
      <span className={style.tagName}>{tagName}</span>
      {'>'}
    </span>
  )
}

const nameByNodeType = {
  1: 'ELEMENT_NODE',
  3: 'TEXT_NODE',
  7: 'PROCESSING_INSTRUCTION_NODE',
  8: 'COMMENT_NODE',
  9: 'DOCUMENT_NODE',
  10: 'DOCUMENT_TYPE_NODE', // http://stackoverflow.com/questions/6088972/get-doctype-of-an-html-as-string-with-javascript
  11: 'DOCUMENT_FRAGMENT_NODE',
}

const DOMNodePreview = ({
  isCloseTag,
  data,
  expanded,
}: {
  isCloseTag?: boolean
  name?: string
  data: any
  expanded: boolean
}) => {
  if (isCloseTag) {
    return <CloseTag isChildNode tagName={data.tagName} />
  }

  switch (data.nodeType) {
    case Node.ELEMENT_NODE:
      return (
        <span>
          <OpenTag tagName={data.tagName} attributes={data.attributes} />

          {shouldInline(data) ? data.textContent : !expanded && '…'}

          {!expanded && <CloseTag tagName={data.tagName} />}
        </span>
      )
    case Node.TEXT_NODE:
      return <span>{data.textContent}</span>
    case Node.CDATA_SECTION_NODE:
      return <span>{'<![CDATA[' + data.textContent + ']]>'}</span>
    case Node.COMMENT_NODE:
      return (
        <span className={styles.htmlComment}>
          {'<!--'}
          {data.textContent}
          {'-->'}
        </span>
      )
    case Node.DOCUMENT_TYPE_NODE:
      return (
        <span className={styles.htmlDoctype}>
          {'<!DOCTYPE '}
          {data.name}
          {data.publicId ? ` PUBLIC "${data.publicId}"` : ''}
          {!data.publicId && data.systemId ? ' SYSTEM' : ''}
          {data.systemId ? ` "${data.systemId}"` : ''}
          {'>'}
        </span>
      )
    case Node.PROCESSING_INSTRUCTION_NODE:
    case Node.DOCUMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      return <span>{data.nodeName}</span>
    default:
      return <span>{nameByNodeType[data.nodeType]}</span>
  }
}

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

export function DOMInspector(props) {
  return (
    <TreeView
      nodeRenderer={DOMNodePreview}
      dataIterator={domIterator}
      {...props}
    />
  )
}
