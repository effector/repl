import React from 'react'
import styled from '@emotion/styled'
import {createComponent, useStore} from 'effector-react'
import {createApi, createStore} from 'effector'
import {TabHeaderList} from '../tabs/styled'
import Sizer from './Sizer'
import {theme} from '../features/logs/lib/console/theme'
// TODO: remove exact dependency on feature, use requirements in the future
import {
  logsClear as clearConsole,
  $logs as logs,
  LogsPanel as LogsView,
} from '../features/logs'
import {$autoScrollLog} from '../settings/state'
import {IconButton} from './IconButton'
import {DesktopScreens, SmallScreens} from '../tabs/view'
import {Outline} from './Outline'
import {tab as $mainTab} from '../tabs/domain'

const tab = createStore('console')
const api = createApi(tab, {
  showConsole: () => 'console',
  showOutline: () => 'outline',
})

const Tab = styled.li`
  border-right: 1px solid #ddd;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 7px 15px;
  margin: 0;
  background-color: ${({isActive}) => (isActive ? 'white' : 'inherit')};
  border-bottom: ${({isActive}) =>
    isActive ? '3px solid #e95801' : '3px solid transparent'};
`

const ToolbarView = createComponent(
  {logs, tab, autoScrollLog: $autoScrollLog, $mainTab},
  ({}, {$mainTab, logs, tab, autoScrollLog}) => (
    <TabHeaderList justify="space-between" style={{border: 'none'}}>
      <div style={{display: 'flex'}}>
        <Tab
          onMouseDown={e => {
            api.showConsole()
          }}
          isActive={tab === 'console' || $mainTab !== 'editor'}>
          Console{' '}
          {logs.length > 0 && (
            <span style={{marginLeft: 10, color: '#999'}}>({logs.length})</span>
          )}
        </Tab>
        <SmallScreens>
          {$mainTab === 'editor' && (
            <Tab onMouseDown={api.showOutline} isActive={tab === 'outline'}>
              Outline
            </Tab>
          )}
        </SmallScreens>
      </div>
      <div style={{margin: '5px 5px 0 0'}}>
        <IconButton
          title="Clear"
          icon={theme.styles.TRASH_ICON}
          onMouseDown={clearConsole}
        />
      </div>
    </TabHeaderList>
  ),
)

const SecondaryTabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #ddd;
  z-index: 1;

  @media (max-width: 699px) {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }

  @media (min-width: 700px) {
    grid-column: 3 / span 1;
    grid-row: 3 / span 1;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }
`

export function SecondaryTabs() {
  const [ref, setRef] = React.useState(null)
  const _tab = useStore(tab)
  const mainTab = useStore($mainTab)

  return (
    <SecondaryTabsWrapper ref={setRef} id="console-panel">
      <Sizer
        direction="horizontal"
        cssVar="--console-height"
        container={ref}
        sign={-1}
        size={28}
        min="0"
        max="calc(100vh - 50px - 32px)"
        middle="calc((100vh - 50px - 32px) / 2)"
        hover=".8">
        <ToolbarView />
      </Sizer>
      <SmallScreens>
        {_tab === 'console' || mainTab !== 'editor' ? (
          <LogsView />
        ) : (
          <Outline />
        )}
      </SmallScreens>
      <DesktopScreens>
        <LogsView />
      </DesktopScreens>
    </SecondaryTabsWrapper>
  )
}
