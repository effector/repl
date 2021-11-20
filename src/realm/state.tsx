import {createStore, Event, Store, Effect, Domain} from 'effector'
import {StoreView} from 'effector-react'

export const intervals = createStore<number[]>([])
export const timeouts = createStore<number[]>([])

export interface Listener {
  type: string
  target: any
  fn: Function
  options?: any
}

export const listeners = createStore<Listener[]>([])

export interface Stats {
  event: Event<any>[]
  store: Store<any>[]
  effect: Effect<any, any, any>[]
  domain: Domain[]
  component: StoreView<any, any>[]
}

export const stats = createStore<Stats>({
  event: [],
  store: [],
  effect: [],
  domain: [],
  component: [],
})
