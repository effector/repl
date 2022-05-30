import {createEvent} from 'effector'

/** When code source changed */
export const sourcesChanged = createEvent<string>()

/** When effector version changed in UI */
export const versionChanged = createEvent<string>()

/**
 * When view library changed in UI (react/solid)
 */
export const viewLibraryChanged = createEvent<string>()

export const realmActiveChanged = createEvent<boolean>()

export const autoScrollLogChanged = createEvent<boolean>()
