import React from 'react'
import ReactDOM from 'react-dom'
import {useStore} from 'effector-react'
import {styled} from 'linaria/react'

import {config} from './config'
import {$csrf, $githubToken, $githubUser} from './state'
import {logout} from './index'
import {auth, getUserInfo} from './init'
import {LoadingIcon} from '../components/Icons/LoadingIcon'

const portalContainer = document.getElementById('auth-section')

const UsernameLink = styled.a`
  margin: 5px 20px 10px 20px;
  color: #555;
  display: flex;
  align-items: center;
  & > span {
    font-weight: bold;
  }
`

const AvatarImage = styled.img`
  margin: 0 5px 0 0;
  width: 32px;
  height: 32px;
`

const DroprownBlock = styled.div`
  align-self: center;
  margin-left: 40px;
  align-items: center;
  cursor: pointer;
  padding-right: 10px;
  overflow: hidden;
  min-width: 18px;
  min-height: 18px;
  & > [data-dropdown='header'] {
    align-self: center;
    display: flex;
    align-items: center;
  }
  & > [data-dropdown='body'] {
    transform-origin: top right;
    transform: scale(0) translateX(-100px);
    &[data-dropdown-open='true'] {
      transform: scale(1) translateX(0px);
    }
    transition: transform 0.2s;
    border: 1px solid #ccc;
    position: absolute;
    top: calc(100% + 10px);
    z-index: 101;
    right: -14px;
    background-color: white;
    color: #333;
    box-shadow: 2px 2px 12px #999;
    padding: 5px 0px;
    border-radius: 5px;
    &::after {
      opacity: 0;
      transition: opacity 0.3s;
      content: '';
      position: absolute;
      border: 10px solid transparent;
      border-bottom-color: white;
      top: -20px;
      right: 30px;
      left: auto;
    }
    &[data-dropdown-open='true']::after {
      opacity: 1;
    }

    & > [data-dropdown='menu-divider'] {
      height: 1px;
      border: none;
      background-color: #eee;
    }

    & > [data-dropdown='menu-item'] {
      padding: 5px 20px;
      transition: background-color 0.25s, color 0.25s;
      background-color: transparent;
      color: #333;
      &:hover {
        background-color: var(--primary-color);
        color: white;
      }
    }
  }
`

const GitHubUserMenu = ({user}) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const closeMenu = e => {
    const {left, right, top, bottom} = ref.current!.getBoundingClientRect()
    if (
      e.pageX < left ||
      e.pageX > right ||
      e.pageY < top ||
      e.pageY > bottom
    ) {
      setOpen(false)
    }
  }

  React.useEffect(() => {
    open && window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [open])

  return (
    <DroprownBlock>
      <div
        data-dropdown="header"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(state => !state)
        }}>
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <DropDownArrow />
      </div>
      <div data-dropdown="body" data-dropdown-open={open} ref={ref}>
        <UsernameLink href={user.url} target="_blank" rel="noreferrer noopener">
          <GitHubCatIcon />
          <span>{user.name}</span>
        </UsernameLink>
        <div data-dropdown="menu-divider" />
        <div
          data-dropdown="menu-item"
          onClick={() => {
            setOpen(false)
            logout()
          }}>
          Sign out
        </div>
      </div>
    </DroprownBlock>
  )
}

const GitHubAuthLink = ({token, ...props}) => {
  return (
    <a
      href="#"
      // target="_blank"
      {...props}
      style={{
        alignSelf: 'center',
        marginLeft: 40,
        // zIndex: 100,
        paddingRight: 10,
        ...props.style,
      }}
      data-fixed-header-link-nav
      onClick={e => {
        e.preventDefault()
        const csrf = Math.random().toString(36)
        //@ts-ignore
        $csrf.setState(csrf)
        config.githubAuthUrl.searchParams.set('state', csrf)
        console.log(config.githubAuthUrl.href)
        location.replace(config.githubAuthUrl.href)
      }}>
      <GitHubCatIcon /> Sign in
    </a>
  )
}

const GithubAuthView = () => {
  const token = useStore($githubToken)
  const userInfo = useStore($githubUser)
  const userInfoPending = useStore(getUserInfo.pending)
  const authPending = useStore(auth.pending)
  if (authPending || userInfoPending) {
    return (
      <div
        style={{
          alignSelf: 'center',
          marginLeft: 40,
          paddingRight: 40,
        }}>
        <LoadingIcon />
      </div>
    )
  }
  if (token) {
    return <GitHubUserMenu user={userInfo} />
  }
  return <GitHubAuthLink token={token} />
}

export const GitHubAuth = () =>
  ReactDOM.createPortal(<GithubAuthView />, portalContainer)

const GitHubCatIcon = () => (
  <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="github"
    width="1.1em"
    height="1.1em"
    fill="currentColor"
    aria-hidden="true"
    style={{margin: '-2px 8px -1px -2px'}}>
    <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" />
  </svg>
)

const DropDownArrow = () => (
  <svg
    viewBox="0 0 1024 1024"
    focusable="false"
    className=""
    data-icon="caret-down"
    width="18px"
    height="18px"
    fill="#000"
    aria-hidden="true">
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" />
  </svg>
)
