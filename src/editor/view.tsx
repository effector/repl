import React from 'react'
import CodeMirror from 'codemirror'
import debounce from 'lodash.debounce'
import {attach, forward, createEffect} from 'effector'
import {createGate, useGate} from 'effector-react'

import './mode/jsx'

import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/wrap/hardwrap'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/keymap/sublime'
import 'codemirror/addon/fold/foldgutter.css'

import {mode, sourceCode} from './state'
import {codeMarkLine, codeSetCursor, codeCursorActivity, changeSources} from '.'
import {codeMirrorConfig} from './codeMirrorConfig'

let codeMirror: CodeMirror.EditorFromTextArea

const CodeMirrorGate = createGate<{}>()

mode.updates.watch(mode => {
  codeMirror.setOption('mode', mode)
})

sourceCode.updates.watch(code => {
  if (codeMirror.getValue() !== code) {
    codeMirror.setValue(code)
  }
})

codeMarkLine.use(
  ({
    from,
    to = {
      line: from.line,
      ch: codeMirror.getLine(from.line)?.length || from.ch,
    },
    options,
  }) => codeMirror.markText(from, to, options),
)

const cursorSetterFx = createEffect(({line, column}) => {
  codeMirror.focus()
  codeMirror.setCursor({line: line - 1, ch: column})
  const cursorCoords = codeMirror.cursorCoords(
    {line: line - 1, ch: column},
    'local',
  )
  const scrollInfo = codeMirror.getScrollInfo()
  codeMirror.scrollTo(
    cursorCoords.left,
    cursorCoords.top - scrollInfo.clientHeight / 2,
  )
})

forward({
  from: codeSetCursor,
  to: cursorSetterFx,
})

const changeSourcesDebounced = debounce(changeSources, 500)

const textareaRef = React.createRef<HTMLTextAreaElement>()

CodeMirrorGate.close.watch(() => {
  codeMirror.toTextArea()
})

const setupCodeMirrorFx = createEffect(
  ({code, mode}: {code: string; mode: string}) => {
    codeMirror = CodeMirror.fromTextArea(textareaRef.current!, codeMirrorConfig)
    codeMirror.on('change', (doc, change) => {
      if (change.origin !== 'setValue') {
        changeSourcesDebounced(doc.getValue())
      }
    })
    codeMirror.on('cursorActivity', codeCursorActivity)

    codeMirror.setOption('mode', mode)
    codeMirror.setValue(code || '')
  },
)

forward({
  from: CodeMirrorGate.open,
  to: attach({
    source: {code: sourceCode, mode},
    effect: setupCodeMirrorFx,
  }),
})

export function CodeMirrorPanel() {
  useGate(CodeMirrorGate)

  return (
    <div className="editor">
      <textarea ref={textareaRef} />
    </div>
  )
}
