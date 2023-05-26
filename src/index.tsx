import {createRoot} from 'react-dom/client'

import {loadLayoutSettings} from './layout-settings'
import './init'
import App from './view'
import React from 'react'

const container = document.getElementById('try-wrapper')
if (!container) throw Error('no body')

loadLayoutSettings()

window.addEventListener(
  'touchmove',
  event => {
    event.preventDefault()
  },
  {passive: false},
)
container.addEventListener(
  'touchmove',
  (event: Event) => {
    event.stopPropagation()
  },
  false,
)

const root = createRoot(container)
root.render(<App />)
