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
  requirements as logs,
  autoScrollDisableClicked,
  autoScrollEnableClicked,
} from '~/features/logs'

forward({from: $autoScrollLog, to: logs.autoScrollLogChanged})
forward({from: changeSources, to: logs.sourcesChanged})
forward({from: selectVersion, to: logs.versionChanged})
forward({from: selectViewLib, to: logs.viewLibraryChanged})
forward({
  from: realmStatus.map(status => status.active),
  to: logs.realmActiveChanged,
})

$autoScrollLog
  .on(autoScrollEnableClicked, () => true)
  .on(autoScrollDisableClicked, () => false)
