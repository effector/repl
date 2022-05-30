import {createEvent, createEffect, Event, Effect} from 'effector'

export const evalFx: Effect<string, any, any> = createEffect()

export const changeSources: Event<string> = createEvent()

export const selectVersion: Event<string> = createEvent()
export const selectViewLib: Event<string> = createEvent()

export const codeSetCursor: Event<any> = createEvent()
export const codeCursorActivity: Event<any> = createEvent()
export const codeMarkLine: Effect<any, any, any> = createEffect()
