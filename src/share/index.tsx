import React from 'react'
import {createEffect, createEvent} from 'effector'

import {SharedItem} from './index.h'

export const saveShare = createEvent()
export const removeShare = createEvent<string>()
export const addShare = createEvent<SharedItem>()
export const getShareList = createEffect()
export const setCurrentShareId = createEvent()
export const copyToClipboard = createEvent()
export const handleInput = createEvent<React.ChangeEvent<HTMLInputElement>>()
export const onTextChange = handleInput.map(e => e.target.value)
export const handleKeyDown = createEvent<
  React.KeyboardEvent<HTMLInputElement>
>()
export const onKeyDown = handleKeyDown.map(e => e.key)
export const setFilterMode = createEvent()
