import React from 'react'
import Linkify from 'linkifyjs/react'

import {MessageProps, Message as MessageType} from './index.h'
import {Message, Icon, Content} from './elements'
import {CustomInspector} from './react-inspector'
import {Root} from './react-inspector/elements'
import {formatMessage} from './devtools-parser'
import {theme} from './theme'

const ObjectTree = ({quoted, log}: {log: MessageType; quoted: boolean}) => {
  if (!log.data) return null
  return (
    <>
      {log.data.map<React.ReactNode>((message, i: number) => {
        if (typeof message === 'string') {
          const string =
            !quoted && message.length ? (
              `${message} `
            ) : (
              <span>
                <span>"</span>
                <span
                  style={{
                    color: theme.styles.OBJECT_VALUE_STRING_COLOR,
                  }}>
                  {message}
                </span>
                <span>" </span>
              </span>
            )

          return (
            <Root data-type="string" key={i}>
              <Linkify>{string}</Linkify>
            </Root>
          )
        }

        return <CustomInspector method={log.method} data={message} key={i} />
      })}
    </>
  )
}

const Formatted = React.memo(({data = []}: {data: any[]}) => {
  const {html, args} = formatMessage(data)
  return (
    <>
      <Root
        data-type="formatted"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
      <ObjectTree quoted={false} log={{method: 'log', data: args}} />
    </>
  )
})

function splitMessage(message: string): string {
  const breakIndex = message.indexOf('\n')
  // consider that there can be line without a break
  if (breakIndex === -1) {
    return message
  }
  return message.substr(0, breakIndex)
}

const ErrorPanel = React.memo(({log}: {log: MessageType}) => {
  if (!log.data) return null

  /* This checks for error logTypes and shortens the message in the console by wrapping
    it a <details /> tag and putting the first line in a <summary /> tag and the other lines
    follow after that. This creates a nice collapsible error message */
  let otherErrorLines
  const msgLine = log.data.join(' ')
  const firstLine = splitMessage(msgLine)
  const msgArray = msgLine.split('\n')
  if (msgArray.length > 1) {
    otherErrorLines = msgArray.slice(1)
  }

  if (!otherErrorLines) {
    return <Linkify>{log.data.join(' ')}</Linkify>
  }

  return (
    <details>
      <summary style={{outline: 'none', cursor: 'pointer'}}>
        {firstLine}
      </summary>
      <Linkify>{otherErrorLines.join('\n\r')}</Linkify>
    </details>
  )
})

function MessageContent({log}: {log: MessageType}) {
  if (!log) {
    return (
      <Formatted
        data={[
          `%c[console-feed] %cFailed to parse message! %clog was typeof ${typeof log}, but it should've been a log object`,
          'color: red',
          'color: orange',
          'color: cyan',
        ]}
      />
    )
  } else if (!Array.isArray(log.data)) {
    return (
      <Formatted
        data={[
          '%c[console-feed] %cFailed to parse message! %clog.data was not an array!',
          'color: red',
          'color: orange',
          'color: cyan',
        ]}
      />
    )
  }
  if (!log.data) return null

  // Chrome formatting
  if (
    log.data.length > 0 &&
    typeof log.data[0] === 'string' &&
    log.data[0].indexOf('%') > -1
  ) {
    return <Formatted data={log.data} />
  }

  // Error panel
  if (
    log.data.every(message => typeof message === 'string') &&
    log.method === 'error'
  ) {
    return <ErrorPanel log={log} />
  }

  if (!log.data) return null

  // Normal inspector
  const quoted = typeof log.data[0] !== 'string'
  return <ObjectTree log={log} quoted={quoted} />
}
export function ConsoleMessage({log, last}: MessageProps) {
  return (
    <Message
      data-method={log.method}
      method={log.method}
      id={last ? 'last-log-message' : undefined}>
      <Icon method={log.method} />
      <Content>
        <MessageContent log={log} />
      </Content>
    </Message>
  )
}
