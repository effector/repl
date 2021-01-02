import React, {useEffect, useState} from 'react'
import {combine} from 'effector'
import {useStore} from 'effector-react'

import 'codemirror/lib/codemirror.css'
import './styles.css'
import './main.css'
import {CodeMirrorPanel} from './editor/view'
import {Errors} from './evaluator/stackframe/view'
import {SecondaryTabs} from './components/SecondaryTabs'
import {Outline} from './components/Outline'
import {isDesktopChanges, tab} from './tabs/domain'
import {DesktopScreens, SmallScreens, TabsView} from './tabs/view'
import Sizer from './components/Sizer'
import {GitHubAuth} from './github/GitHubAuthLink'
import {MenuContent} from './Menu'

const $displayOutline = combine(
  tab,
  isDesktopChanges,
  (tab, isDesktop) => isDesktop || tab === 'editor',
)

const CodeView = () => {
  const displayEditor = useStore($displayOutline)
  const [outlineSidebar, setOutlineSidebar] = useState(null)
  const [consolePanel, setConsolePanel] = useState(null)

  useEffect(() => {
    setOutlineSidebar(document.getElementById('outline-sidebar'))
    setConsolePanel(document.getElementById('console-panel'))
  }, [])

  return (
    <div
      className="sources"
      style={{
        visibility: displayEditor ? 'visible' : 'hidden',
        display: 'flex',
      }}>
      <DesktopScreens>
        <Sizer
          direction="vertical"
          container={outlineSidebar}
          cssVar="--outline-width"
          sign={1}
        />
      </DesktopScreens>

      <div className="sources" style={{flex: '1 0 auto'}}>
        <CodeMirrorPanel />
      </div>

      <DesktopScreens>
        <Sizer
          direction="vertical"
          container={consolePanel}
          cssVar="--right-panel-width"
          sign={-1}
        />
      </DesktopScreens>
    </div>
  )
}

export default () => {
  const displayOutline = useStore($displayOutline)
  const _tab = useStore(tab)
  return (
    <>
      {displayOutline && <Outline />}
      <CodeView />
      <TabsView />
      <MenuContent />
      <SmallScreens>
        {_tab !== 'share' && _tab !== 'settings' && (
          <>
            <SecondaryTabs />
            <Errors />
          </>
        )}
      </SmallScreens>
      <DesktopScreens>
        <SecondaryTabs />
        <Errors />
      </DesktopScreens>
      <GitHubAuth />
    </>
  )
}
