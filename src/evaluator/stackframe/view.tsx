import {useStore} from 'effector-react'
import styled from '@emotion/styled'
import React from 'react'

import {$codeError} from '../../editor/state'
import {StackFrame} from './stack-frame'

const Link = styled.div`
  font-size: 0.9em;
  margin-bottom: 0.9em;
  /* Top bottom margin spaces header
     Right margin revents overlap with close button */
  margin: 0 2rem 0.75rem 0;
`

const ErrorsHeader = styled.div`
  font-size: 1.5em;
  font-family: sans-serif;
  white-space: pre-wrap;
  flex: 0 0 auto;
  max-height: 50%;
  overflow: auto;
`

function getPrettyURL(
  sourceFileName: string | null,
  sourceLineNumber: number | null,
  sourceColumnNumber: number | null,
  fileName: string | null,
  lineNumber: number | null,
  columnNumber: number | null,
  compiled: boolean,
): string {
  let prettyURL
  if (!compiled && sourceFileName && typeof sourceLineNumber === 'number') {
    // Remove everything up to the first /src/ or /node_modules/
    const trimMatch = /^[/|\\].*?[/|\\]((src|node_modules)[/|\\].*)/.exec(
      sourceFileName,
    )
    if (trimMatch && trimMatch[1]) {
      prettyURL = trimMatch[1]
    } else {
      prettyURL = sourceFileName
    }
    prettyURL += ':' + sourceLineNumber
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (sourceColumnNumber) {
      prettyURL += ':' + sourceColumnNumber
    }
  } else if (fileName && typeof lineNumber === 'number') {
    prettyURL = fileName + ':' + lineNumber
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (columnNumber) {
      prettyURL += ':' + columnNumber
    }
  } else {
    prettyURL = 'unknown'
  }
  return prettyURL.replace('webpack://', '.')
}

export function StackFrameView({frame}: {frame: StackFrame}) {
  const {
    fileName,
    lineNumber,
    columnNumber,
    _originalFileName: sourceFileName,
    _originalLineNumber: sourceLineNumber,
    _originalColumnNumber: sourceColumnNumber,
  } = frame
  const functionName = frame.getFunctionName()
  const url = getPrettyURL(
    sourceFileName,
    sourceLineNumber,
    sourceColumnNumber,
    fileName,
    lineNumber,
    columnNumber,
    false,
  )
  return (
    <div>
      <div>{functionName}</div>
      <Link>{url}</Link>
    </div>
  )
}

export function Errors() {
  const {isError, error, stackFrames} = useStore($codeError)
  if (isError) {
    if (!error) {
      return (
        <pre key="error-window" className="errors has-errors">
          <ErrorsHeader>Unknown error</ErrorsHeader>
        </pre>
      )
    }
    const errorName = error.name
    const message = error.message
    const headerText =
      message.match(/^\w*:/) || !errorName ? message : errorName
    return (
      <pre key="error-window" className="errors has-errors">
        <ErrorsHeader>{headerText}</ErrorsHeader>
        {errorName && <div>{message}</div>}
        {stackFrames.length > 0 && (
          <div>
            {stackFrames.map(frame => (
              <StackFrameView frame={frame} />
            ))}
          </div>
        )}
      </pre>
    )
  }
  return <pre key="error-window" className="errors no-errors" />
}
