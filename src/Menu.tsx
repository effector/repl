import React from 'react'
import {styled} from 'linaria/react'
import {createStore, createEvent} from 'effector'
import {useStore, useList} from 'effector-react'

import {config} from './github/config'
import {$csrf, $githubToken, $githubUser} from './github/state'
import {logout} from './github/index'

import {clickPrettify, prettier} from './settings'
import {packageVersions, version} from './editor/state'
import {selectVersion} from './editor'
import {LoadingIcon} from './components/Icons/LoadingIcon'

export const toggleMenu = createEvent<any>()
const isMenuOpen = createStore(true).on(toggleMenu, open => !open)

const PrettifyButton = styled.button`
  --color-main: #e95801;

  border: none;
  border-radius: 3px;
  text-decoration: none;
  background: var(--color-main);
  color: #ffffff;
  transition: background 70ms ease-in-out, transform 150ms ease;
  line-height: 2.5;
  font-size: 20px;
  padding: 0px 20px;

  &:hover,
  &:focus {
    background: #0053ba;
  }

  &:focus {
    outline: 1px solid #fff;
    outline-offset: -4px;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: hsl(213, 50%, 45%);
    color: hsla(0, 0%, 100%, 0.9);
    cursor: not-allowed;
  }
`

const MenuIcon = () => {
  return (
    <svg
      onClick={toggleMenu}
      viewBox="0 0 1000 1000"
      focusable="false"
      width="32px"
      height="32px"
      fill="#24292e"
      aria-hidden="true">
      <path d="M 150 0 L 1000 850 L 850 1000 L 0 150 Z M 850 0 L 1000 150 L 150 1000 L 0 850 Z" />
    </svg>
  )
}

const MenuBlock = styled.section`
  display: none;
  padding: 1rem;
  @media only screen and (any-pointer: coarse) and (max-width: 767px) {
    & {
      display: grid;
    }
  }
  @supports (padding-top: env(safe-area-inset-top, 0)) and
    (padding-top: clamp(0px, 0px, 0px)) {
    @media screen {
      & {
        padding-top: clamp(env(safe-area-inset-top, 0), 2vmin, 2vh);
        padding-bottom: clamp(env(safe-area-inset-bottom, 0), 2vmin, 2vh);
        padding-left: clamp(env(safe-area-inset-left, 0), 8vmin, 8vw);
        padding-right: clamp(env(safe-area-inset-right, 0), 8vmin, 8vw);
      }
    }
  }
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: contain;
  background: #fff;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  z-index: 100;
  & > [data-menu-top-group] {
    display: grid;
    align-self: start;
  }
  & > [data-menu-bottom-group] {
    display: grid;
    align-self: end;
    & > [data-menu-bottom-link] {
      padding-left: 24px;
    }
  }
  & a {
    color: #24292e;
  }
  & a:hover {
    /* background: rgba(0, 0, 0, 0.05); */
    color: #606770;
  }
`

const Divider = styled.div`
  width: 100%;
  height: 0;
  border-bottom: 1px solid #e0e0e0;
`

const MenuRow = styled.div`
  line-height: 2;
  font-size: 24px;
  margin-left: 10px;
  &[data-menu-row-flex] {
    display: flex;
  }
`

const MenuHeader = styled.div`
  font-size: 32px;
  color: inherit;
  font-weight: 600;
`

const HeadMenuRow = styled(MenuRow)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.25;
  margin-bottom: 16px;
  margin-top: 1.5em;
`

const ProfileMenuRow = styled(MenuRow)`
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: 2fr 1fr;
  & > [data-profile-avatar] {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    justify-self: center;
    align-self: center;
    object-fit: contain;
  }
  & > svg[data-profile-avatar] {
    max-width: 55px;
  }
  & > [data-profile-username] {
    color: #555;
    align-self: center;
    grid-column: 2 / 3;
    grid-row: 1;
    & > div {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 60vmin;
    }
  }
  & > [data-profile-signout] {
    align-self: start;
    grid-column: 2 / 3;
    grid-row: 2;
    font-size: 16px;
    cursor: pointer;
    line-height: initial;
  }
  & > [data-profile-signin] {
    color: #555;
    align-self: center;
    grid-row: 1 / 3;
    grid-column: 2 / 3;
  }
`

const EffectorVersionMenuRow = styled(MenuRow)`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-size: 22px;
  line-height: 2.5;
  & > [data-version-label] {
  }
  & > [data-version-select] {
    display: inherit;
  }
`

const SignedInGithubRow = () => {
  const user = useStore($githubUser)
  return (
    <ProfileMenuRow>
      <img data-profile-avatar src={user.avatarUrl} alt={user.name} />
      <a
        data-profile-username
        href={user.url}
        target="_blank"
        rel="noreferrer noopener">
        <div>{user.name}</div>
      </a>
      <div
        data-profile-signout
        onClick={e => {
          logout()
        }}>
        Sign out
      </div>
    </ProfileMenuRow>
  )
}

const SignedOutGithubRow = () => {
  return (
    <ProfileMenuRow>
      <GitHubCatIcon />
      <a
        data-profile-signin
        onClick={e => {
          e.preventDefault()
          const csrf = Math.random().toString(36)
          //@ts-ignore
          $csrf.setState(csrf)
          config.githubAuthUrl.searchParams.set('state', csrf)
          console.log(config.githubAuthUrl.href)
          location.replace(config.githubAuthUrl.href)
        }}>
        <div>Sign in</div>
      </a>
    </ProfileMenuRow>
  )
}

const GitHubCatIcon = () => (
  <svg
    data-profile-avatar
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="github"
    fill="currentColor"
    aria-hidden="true">
    <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" />
  </svg>
)

export const MenuContent = () => {
  const token = useStore($githubToken)
  const isPrettifyPending = useStore(prettier.pending)
  const isOpen = useStore(isMenuOpen)
  const usedVersion = useStore(version)
  const versionList = useList(packageVersions, item => (
    <option value={item}>{item}</option>
  ))
  if (!isOpen) return null
  return (
    <MenuBlock>
      <div data-menu-top-group>
        <HeadMenuRow>
          <MenuHeader>Menu</MenuHeader>
          <MenuIcon />
        </HeadMenuRow>
        <Divider />
        {token ? <SignedInGithubRow /> : <SignedOutGithubRow />}
        <Divider />
        <EffectorVersionMenuRow>
          <label htmlFor="versionSelectorMenu" data-version-label>
            effector version
          </label>
          <div data-version-select>
            <select
              id="versionSelectorMenu"
              value={usedVersion}
              onChange={e => selectVersion(e.currentTarget.value)}>
              {versionList}
            </select>
          </div>
        </EffectorVersionMenuRow>
        <Divider />
        <MenuRow data-menu-row-flex>
          <PrettifyButton disabled={isPrettifyPending} onClick={clickPrettify}>
            {isPrettifyPending && <LoadingIcon style={{marginRight: 10}} />}
            Format code
          </PrettifyButton>
        </MenuRow>
        <Divider />
      </div>

      <div data-menu-bottom-group>
        <MenuRow>Links:</MenuRow>
        <Divider />
        <MenuRow data-menu-bottom-link>
          <a
            href="https://effector.dev/docs/introduction/installation"
            target="_self">
            Docs
          </a>
        </MenuRow>
        <Divider />
        <MenuRow data-menu-bottom-link>
          <a
            href="https://effector.dev/docs/api/effector/effector"
            target="_self">
            API
          </a>
        </MenuRow>
        <Divider />
        <MenuRow data-menu-bottom-link>
          <a href="https://changelog.effector.dev" target="_self">
            Changelog
          </a>
        </MenuRow>
        <Divider />
        <MenuRow data-menu-bottom-link>
          <a href="https://github.com/effector/effector" target="_self">
            GitHub
          </a>
        </MenuRow>
      </div>
    </MenuBlock>
  )
}
