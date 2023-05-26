import React from 'react'
import styled from '@emotion/styled'
import {useStore} from 'effector-react'

import {codeSetCursor} from '../editor'
import {$stats} from '../realm/state'

const OutlineWrapper = styled.div`
  grid-column: 1 / span 1;
  grid-row: 2 / span 1;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  font-size: 0.8rem;
  overflow: auto;

  @media (min-width: 700px) {
    grid-column: 1 / span 1;
    grid-row: 1 / span 3;
  }
`

const Header = styled.div`
  padding: 3px 5px;
  background: #f7f7f7;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
`

const Section = styled.section`
  padding: 5px;
`

const EmptySection = styled.section`
  padding: 15px;
`

const Item = styled.li`
  cursor: ${(props: any) => (Boolean(props.loc) ? 'pointer' : 'inherit')};
`

const OutlineSection = ({list, title}) => {
  if (list.length === 0) return null
  return (
    <>
      <Header>{title}</Header>
      <Section>
        <ol>
          {list.map((item, i) => {
            const loc = item?.defaultConfig?.loc
            const name =
              item?.compositeName?.fullName ||
              item?.shortName ||
              item.id ||
              item.displayName
            const key = item.kind && item.id ? item.kind + item.id + name : name
            const onClick = () => {
              if (loc) codeSetCursor(loc)
            }
            return (
              <Item loc={loc} onClick={onClick} key={`${key} ${i}`}>
                {name}
              </Item>
            )
          })}
        </ol>
      </Section>
    </>
  )
}

export function Outline() {
  const {component, domain, event, effect, store} = useStore($stats)
  const isEmpty =
    event.length === 0 &&
    effect.length === 0 &&
    store.length === 0 &&
    domain.length === 0 &&
    component.length === 0
  return (
    <OutlineWrapper id="outline-sidebar">
      {isEmpty && (
        <EmptySection>Symbols weren&apos;t found in this file</EmptySection>
      )}
      <OutlineSection list={event} title="Events" />
      <OutlineSection list={effect} title="Effects" />
      <OutlineSection list={store} title="Stores" />
      <OutlineSection list={domain} title="Domains" />
      <OutlineSection list={component} title="Components" />
    </OutlineWrapper>
  )
}
