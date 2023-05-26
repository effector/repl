import {useList, useStore, useStoreMap} from 'effector-react'
import styled from '@emotion/styled'
import React from 'react'

import {
  addNamesToggleChange,
  clickPrettify,
  debugSidsToggleChange,
  factoriesChange,
  importNameChange,
  prettierFx,
  reactSSRToggleChange,
} from '.'

import {LoadingIcon} from '../components/Icons/LoadingIcon'
import {selectVersion, selectViewLib} from '../editor'
import {$packageVersions, $version, $viewLibraries} from '../editor/state'
import {
  $addNames,
  $debugSids,
  $factories,
  $importName,
  $reactSsr,
  $viewLib,
} from '../settings/state'

export const PrettifyButton = () => {
  const {disabled, pending} = useStoreMap({
    store: prettierFx.pending,
    keys: [],
    fn: pending => ({
      disabled: pending,
      pending,
    }),
  })
  return (
    <Button
      disabled={disabled}
      onClick={clickPrettify}
      style={{
        padding: 0,
        flex: '0 0 100px',
        height: 28,
        lineHeight: 0,
        margin: '0 10px 0 3px',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        justifyContent: 'center',
      }}>
      {pending && <LoadingIcon style={{marginRight: 10}} />}
      Prettify
    </Button>
  )
}

export const Settings = () => (
  <SettingsGroup>
    <Section>
      <Label>
        <div className="versions">
          <select
            value={useStore($version)}
            onChange={e => selectVersion(e.currentTarget.value)}>
            {useList($packageVersions, item => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>
        Effector version
      </Label>
    </Section>
    <Section>
      <Label>
        <div>
          <select
            value={useStore($viewLib)}
            onChange={e => selectViewLib(e.currentTarget.value)}>
            {useList($viewLibraries, item => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>
        View library
      </Label>
    </Section>
    <Section>
      <Label>
        <div>
          <input
            type="checkbox"
            checked={useStore($debugSids) ?? false}
            onChange={debugSidsToggleChange}
          />
        </div>
        Debug SIDs
      </Label>
      <Label>
        <div>
          <input
            type="checkbox"
            checked={useStore($reactSsr) ?? false}
            onChange={reactSSRToggleChange}
          />
        </div>
        React SSR
      </Label>
      <Label>
        <div>
          <input
            type="checkbox"
            checked={useStore($addNames) ?? false}
            onChange={addNamesToggleChange}
          />
        </div>
        Add names
      </Label>
      <Label>
        <div>
          <input
            type="text"
            value={useStore($importName) ?? ''}
            onChange={importNameChange}
          />
        </div>
        Import name
      </Label>
      <Label>
        <div>
          <input
            type="text"
            value={useStore($factories).join(', ')}
            onChange={e =>
              factoriesChange(
                e.currentTarget.value
                  .split(',')
                  .map(e => e.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
        <div>
          Factories <span>ex.:(first, second)</span>
        </div>
      </Label>
    </Section>
  </SettingsGroup>
)

const SettingsGroup = styled.div`
  --settings-row-padding: 15px;

  background-color: #f7f7f7;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  grid-column: 3 / span 1;
  grid-row: 2 / span 1;
  overflow-x: auto;

  @media (max-width: 699px) {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;
  }
`

const Label = styled.label`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: auto 1fr;
  padding: var(--settings-row-padding);
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  cursor: pointer;

  & span {
    font-weight: normal;
  }
`

export const Section = styled.section`
  background-color: #fff;
  border-bottom: 15px solid #f7f7f7;

  & + & {
    border-top: 1px solid #ddd;
  }
`

const Button = styled.button`
  --color-main: #e95801;
  margin: var(--settings-row-padding);

  display: inline-block;
  border: none;
  border-radius: 3px;
  border-width: 0;
  padding: 0.5rem 1rem;
  text-decoration: none;
  background: var(--color-main);
  color: #ffffff;
  font-family: sans-serif;
  //font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition: background 70ms ease-in-out, transform 150ms ease;
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
    background: hsl(213, 50%, 45%);
    color: hsla(0, 0%, 100%, 0.9);
    cursor: not-allowed;
  }
`
