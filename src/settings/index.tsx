import {SyntheticEvent} from 'react'
import {createEffect, createEvent} from 'effector'

export const flowToggleChange = createEvent<SyntheticEvent<HTMLInputElement>>()

export const tsToggleChange = createEvent<SyntheticEvent<HTMLInputElement>>()

export const typeHoverToggleChange = createEvent<SyntheticEvent<HTMLInputElement>>()

export const clickPrettify = createEvent<any>()
export const prettierFx = createEffect<{code: string; parser: 'flow' | 'typescript' | 'babel'},
  string,
  Error>()

export const enableAutoScroll = createEvent()
export const disableAutoScroll = createEvent()
