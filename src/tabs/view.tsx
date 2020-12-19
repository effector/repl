import React from 'react'
import {useStore, useStoreMap} from 'effector-react'
import {tab as _tab, tabApi} from './domain'
import {PrettifyButton, Settings} from '../settings/view'
import {Share} from '../share/view'
import {TabHeader, TabHeaderList} from './styled'
import {createMediaQuery} from '~/lib/media-query'

export const SmallScreens = createMediaQuery('(max-width: 699px)')
export const DesktopScreens = createMediaQuery('(min-width: 700px)')

const tabs = {
  editor: {
    select: tabApi.showEditor,
    title: 'Editor',
  },
  outline: {
    select: tabApi.showOutline,
    title: 'Outline',
  },
  dom: {
    select: tabApi.showDOM,
    title: 'DOM',
  },
  share: {
    select: tabApi.showShare,
    title: 'Share',
  },
  settings: {
    select: tabApi.showSettings,
    title: 'Settings',
  },
}

const TabHeaderTemplate = ({name}) => {
  const isActive = useStoreMap({
    store: _tab,
    keys: [name],
    fn: (activeTab, [tab]) => activeTab === tab,
  })
  const {select, title} = tabs[name]
  return (
    <TabHeader onClick={select} isActive={isActive}>
      {title}
    </TabHeader>
  )
}

export const TabsView = () => {
  const tab = useStore(_tab)
  return (
    <>
      <TabHeaderList
        className="header-tabs"
        style={{
          borderLeft: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <PrettifyButton />
        <SmallScreens>
          <TabHeaderTemplate name="editor" />
        </SmallScreens>
        <TabHeaderTemplate name="dom" />
        <TabHeaderTemplate name="share" />
        <TabHeaderTemplate name="settings" />
      </TabHeaderList>
      <div style={{display: tab === 'dom' ? 'block' : 'none'}} className="dom">
        <iframe id="dom" />
      </div>
      {tab === 'share' && <Share />}
      {tab === 'settings' && <Settings />}
    </>
  )
}
