import { track, trigger } from './effect.js'



export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {

      track(target, key)
      // TODO 收集依赖
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      // TODO 触发依赖
      return res
    }
  })
}