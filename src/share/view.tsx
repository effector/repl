import {useStore} from 'effector-react'
import styled from '@emotion/styled'
import React from 'react'

import {theme} from '../features/logs/lib/console/theme'
import {getUserInfo} from '../github/init'
import {$debouncedInput} from './debounceInput'

import {IconButton} from '../components/IconButton'
import {CopyIcon} from '../components/Icons/CopyIcon'
import {LoadingIcon} from '../components/Icons/LoadingIcon'
import {ShareIcon} from '../components/Icons/ShareIcon'
import {isShareAPISupported} from '../device'
import {getShareListByAuthorFx, shareCodeFx} from '../graphql'
import {Section} from '../settings/view'
import {sharing} from './controller'
import {
  handleInput,
  handleKeyDown,
  onTextChange,
  removeShare,
  setCurrentShareId,
  setFilterMode,
} from './index'
import {$sortedShareList} from './init'
import {$currentShareId, $filterMode, $shareDescription} from './state'

const Save = ({disabled}: {disabled: boolean}) => {
  const pending = useStore(shareCodeFx.pending)
  return (
    <ShareButton onClick={shareCodeFx} disabled={disabled || pending}>
      {pending && <LoadingIcon style={{marginRight: 10}} />}
      Save app
    </ShareButton>
  )
}

const ShareButton = styled.button`
  display: inline-block;
  border: none;
  text-decoration: none;
  background: hsl(213, 100%, 46%);
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  -webkit-appearance: none;
  -moz-appearance: none;

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
    opacity: 0.65;
    background: hsl(213, 50%, 45%);
    color: hsla(0, 0%, 90%, 0.9);
    cursor: not-allowed;
  }
  border-radius: 2px;
  padding: 0.5rem 1rem;
  border-width: 0;
  margin: 0;
  margin-left: 6px;
  white-space: nowrap;
  transition: width 0.25s;
`

const ShareItem = styled.a`
  --shareItemColor: #333;
  --shareItemBorderColor: transparent;
  &[data-item-active='true'] {
    --shareItemBorderColor: var(--primary-color);
    --shareItemColor: var(--primary-color);
  }
  display: block;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
  border-left: 3px solid var(--shareItemBorderColor);
  color: var(--shareItemColor);
`

const ShareRow = styled.div`
  cursor: pointer;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ShareDate = styled.time`
  text-align: left;
  color: #999;
  font-size: 12px;
`

const ShareDescription = styled.div`
  flex: 1 1 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  &:hover {
    color: var(--link-color);
  }
  max-width: calc(100vw - 100px);
  @media (min-width: 699px) {
    max-width: calc(100% - 70px);
  }
`

const DescriptionInputGroup = styled.div`
  position: relative;
  width: 100%;
`

const ShareGroup = styled.div`
  background-color: #f7f7f7;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  grid-column: 3 / span 1;
  grid-row: 2 / span 1;

  @media (max-width: 699px) {
    grid-column: 1 / span 1;
    grid-row: 2 / span 2;
  }
`

const SaveSection = styled(Section)`
  background-color: #f0f0f0;
  padding: 4px;
  display: flex;
  align-items: center;
  margin: 0;
  border: none;
  border-bottom: 1px solid #ddd;
`

const ShareListSection = styled(Section)`
  margin: 0;
  padding: 0;
  overflow-y: auto;
  border-top: none;
  border-bottom: none;
  height: calc(100% - 42px);
`

const MiniButton = styled.button`
  color: #888888;
  border: none;
  outline: none;
  background-color: transparent !important;
  border-radius: 5px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  position: absolute;
  right: 40px;
  padding: 2px 0;
  &:hover {
    color: var(--link-color);
  }
`

const DeleteIconButton = styled(IconButton)`
  position: absolute;
  right: 0;
  width: 24px;
  height: 24px;
  fill: red;
`

const ShareItemButtonsSection = styled.div`
  margin-left: 10px;
  position: relative;
`

const ShareListStatus = styled.h2`
  color: #aaa;
  font-weight: bold;
  text-align: center;
  margin-top: 30px;
`

const ClearInputIconSvg = styled.svg`
  fill: gray;
  width: 16px;
  cursor: pointer;
  position: absolute;
  right: 4px;
  top: 8px;
`

const FilterIconSvg = styled.svg`
  --filterIconColor: lightgray;
  &[data-item-active='true'] {
    --filterIconColor: hsl(213, 100%, 46%);
  }
  fill: var(--filterIconColor);
  width: 20px;
  margin: 0 10px;
  cursor: pointer;
`

const status = {
  loading: 'Loading user share list...',
  signing: 'Loading user info...',
  empty: 'No shares found by the author',
}

const dateStringFormatter = new Intl.DateTimeFormat(['en-US'], {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const timeStringFormatter = new Intl.DateTimeFormat(['en-US'], {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
})

const ShareList = ({filterMode, description}) => {
  let sortedShareList = useStore($sortedShareList)
  const currentShareId = useStore($currentShareId)
  const loading = useStore(getShareListByAuthorFx.pending)
  const signing = useStore(getUserInfo.pending)
  const isEmpty = sortedShareList.length === 0

  if (loading || signing || isEmpty) {
    return (
      <ShareListStatus>
        {loading ? status.loading : signing ? status.signing : status.empty}
      </ShareListStatus>
    )
  }

  if (filterMode && description) {
    sortedShareList = sortedShareList.filter(
      share =>
        share?.description &&
        (share?.description?.trim().toLowerCase().indexOf(description) !== -1 ||
          share?.code?.trim().indexOf(description) !== -1),
    )
  }

  return (
    <>
      {sortedShareList.map(share => {
        const d = new Date(share.created * 1000)
        const dateString = dateStringFormatter.format(d)
        const timeString = timeStringFormatter.format(d)
        const dateISO = d.toISOString()

        const copyLink = e => {
          e.preventDefault()
          e.stopPropagation()

          const tmp = document.createElement('input')
          //@ts-ignore
          tmp.contentEditable = true
          tmp.readOnly = false
          tmp.value = `${location.origin}/${share.slug}`
          document.body.appendChild(tmp)
          tmp.select()
          document.execCommand('copy')
          document.body.removeChild(tmp)
          //@ts-ignore
          window.scrollY = 0
        }

        return (
          <ShareItem
            key={share.slug}
            onClick={() => setCurrentShareId(share.slug)}
            data-item-active={currentShareId === share.slug}
            href={`${location.origin}/${share.slug}`}>
            <ShareRow>
              <ShareDescription>
                {typeof share.description === 'undefined' ||
                share.description === null ||
                share.description === ''
                  ? `<${share.slug}>`
                  : share.description}
              </ShareDescription>
              <ShareItemButtonsSection>
                {isShareAPISupported ? (
                  <MiniButton
                    title="Share"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      sharing({
                        slug: share.slug,
                        sharedUrl: `https://share.effector.dev/${share.slug}`,
                      })
                    }}>
                    <ShareIcon width="20px" height="20px" />
                  </MiniButton>
                ) : (
                  <MiniButton title="Copy to clipboard" onClick={copyLink}>
                    <CopyIcon width="20px" height="20px" />
                  </MiniButton>
                )}
                <DeleteIconButton
                  title="Delete"
                  icon={theme.styles.TRASH_ICON}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (confirm('Are you sure delete this share?')) {
                      removeShare(share.slug)
                    }
                  }}
                />
              </ShareItemButtonsSection>
            </ShareRow>
            <ShareRow>
              <ShareDate dateTime={dateISO}>
                {dateString} {timeString}
              </ShareDate>
            </ShareRow>
          </ShareItem>
        )
      })}
    </>
  )
}

const ValidatedInput = styled.input`
  outline: none;
  border: none;
  box-shadow: 0 0 1px black;
  :invalid {
    box-shadow: 0 0 4px red;
  }
  height: 32px;
  padding: 4px 24px 4px 4px;
  width: 100%;
  &::placeholder {
    color: #777;
  }
`

export const Share = () => {
  const shareDescription = useStore($shareDescription)
  const saving = useStore(shareCodeFx.pending)
  const filterMode = useStore($filterMode)
  const descRef = React.useRef<HTMLInputElement>(null)
  const debouncedInput = useStore($debouncedInput)

  return (
    <ShareGroup>
      <SaveSection>
        <FilterIconSvg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 477.875 477.875"
          data-item-active={filterMode}
          onClick={() => {
            setFilterMode(!filterMode)
            setTimeout(() => descRef?.current?.focus())
          }}>
          <g>
            <path
              d={
                'M460.804,0H17.071C7.645,0,0.004,7.641,0.004,17.067V102.4c0.001,4.836,2.054,9.445,5.649,12.681l165.018,148.514V460.8' +
                'c-0.004,9.426,7.633,17.07,17.059,17.075c2.651,0.001,5.266-0.615,7.637-1.8l102.4-51.2c5.786-2.891,9.441-8.806,9.438-15.275' +
                'V263.595l165.018-148.48c3.604-3.243,5.658-7.866,5.649-12.715V17.067C477.871,7.641,470.23,0,460.804,0z M443.737,94.805' +
                'L278.72,243.285c-3.604,3.243-5.657,7.866-5.649,12.715v143.053l-68.267,34.133V256c-0.001-4.836-2.054-9.445-5.649-12.68' +
                'L34.137,94.805V34.133h409.6V94.805z'
              }
            />
          </g>
        </FilterIconSvg>
        <DescriptionInputGroup>
          <ValidatedInput
            ref={descRef}
            type="text"
            placeholder="Share description"
            value={shareDescription || ''}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
            autoFocus={false}
          />
          <ClearInputIconSvg
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => onTextChange('')}>
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z" />
          </ClearInputIconSvg>
        </DescriptionInputGroup>
        <Save disabled={saving} />
      </SaveSection>

      <ShareListSection>
        <ShareList
          filterMode={filterMode}
          description={debouncedInput.trim().toLowerCase()}
        />
      </ShareListSection>
    </ShareGroup>
  )
}
