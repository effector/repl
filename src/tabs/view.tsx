import React from 'react'
import {useStore, useStoreMap} from 'effector-react'
import {tab as _tab, tabApi} from './domain'
import {PrettifyButton, Settings} from '../settings/view'
import {Share} from '../share/view'
import {TabHeader, TabHeaderList} from './styled'
import {createMediaQuery, createMediaMatcher} from '~/lib/media-query'
import {toggleMenu} from '../Menu'

export const SmallScreens = createMediaQuery('(max-width: 699px)')
export const DesktopScreens = createMediaQuery('(min-width: 700px)')
const isCoarsePointer = createMediaMatcher(
  'only screen and (any-pointer: coarse) and (max-width: 767px)',
)

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
  let tab = useStore(_tab)
  const isCoarse = useStore(isCoarsePointer)
  if (isCoarse && tab === 'settings') tab = 'editor'
  return (
    <>
      <TabHeaderList
        className="header-tabs"
        style={{
          borderLeft: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        {!isCoarse && <PrettifyButton />}
        <SmallScreens>
          <TabHeaderTemplate name="editor" />
        </SmallScreens>
        <TabHeaderTemplate name="dom" />
        <TabHeaderTemplate name="share" />
        {!isCoarse && <TabHeaderTemplate name="settings" />}
        {isCoarse && (
          <TabHeader onClick={toggleMenu} style={{paddingBottom: 0}}>
            <MenuButton />
          </TabHeader>
        )}
      </TabHeaderList>
      <div style={{display: tab === 'dom' ? 'block' : 'none'}} className="dom">
        <iframe id="dom" />
      </div>
      {tab === 'share' && <Share />}
      {tab === 'settings' && <Settings />}
    </>
  )
}

const MenuButton = () => {
  return (
    <svg
      viewBox="0 0 1000 1000"
      focusable="false"
      width="20px"
      height="20px"
      fill="#24292e"
      aria-hidden="true">
      <path d="M 0 0 L 1000 0 L 1000 210 L 0 210 Z M 0 395 L 1000 395 L 1000 605 L 0 605 Z M 0 790 L 1000 790 L 1000 1000 L 0 1000 Z" />
    </svg>
  )
}
