import {forward} from 'effector'

import './settings/init'
import './realm/init'
import './github/init'
import './share/init'
import './editor/init'

import {$autoScrollLog} from './settings/state'
import {changeSources, selectVersion, selectViewLib} from './editor'
import {realmStatus} from './realm'

import {
  requirements,
  autoScrollDisableClicked,
  autoScrollEnableClicked,
} from '~/features/logs'

forward({from: $autoScrollLog, to: requirements.autoScrollLogChanged})
forward({from: changeSources, to: requirements.sourcesChanged})
forward({from: selectVersion, to: requirements.versionChanged})
forward({from: selectViewLib, to: requirements.viewLibraryChanged})
forward({
  from: realmStatus.map(status => status.active),
  to: requirements.realmActiveChanged,
})

$autoScrollLog
  .on(autoScrollEnableClicked, () => true)
  .on(autoScrollDisableClicked, () => false)
