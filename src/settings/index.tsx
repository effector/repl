import {createEffect, createEvent} from 'effector'
import {SyntheticEvent} from 'react'

export const flowToggleChange = createEvent<SyntheticEvent<HTMLInputElement>>()

export const tsToggleChange = createEvent<SyntheticEvent<HTMLInputElement>>()

export const typeHoverToggleChange =
  createEvent<SyntheticEvent<HTMLInputElement>>()

export const clickPrettify = createEvent<any>()
export const prettierFx = createEffect<
  {code: string; parser: 'flow' | 'typescript' | 'babel'},
  string,
  Error
>()

export const enableAutoScroll = createEvent()
export const disableAutoScroll = createEvent()

export const debugSidsToggleChange =
  createEvent<SyntheticEvent<HTMLInputElement>>()
export const addNamesToggleChange =
  createEvent<SyntheticEvent<HTMLInputElement>>()
export const reactSSRToggleChange =
  createEvent<SyntheticEvent<HTMLInputElement>>()
export const factoriesChange = createEvent<string[]>()
export const importNameChange = createEvent<SyntheticEvent<HTMLInputElement>>()
