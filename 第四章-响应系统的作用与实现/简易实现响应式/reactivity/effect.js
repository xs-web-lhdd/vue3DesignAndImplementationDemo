
const targetMap = new WeakMap()

let activeEffect
 
export function track(target, key) {
  let depMaps = targetMap.get(target)
  if(!depMaps) {
    targetMap.set(target, (depMaps = new Map()))
  }
  let dep = depMaps.get(key)
  if(!dep) {
    depMaps.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  const depMaps = targetMap.get(target)
  const dep = depMaps.get(key)

  dep.forEach(effect => {
    if(activeEffect !== effect) {
      if(effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}


class ReactiveEffect {
  constructor(fn, scheduler) {
    this._fn = fn
    this.scheduler = scheduler
    this.deps = []
    this.active = true
  }

  run() {
    activeEffect = this
    return this._fn()
  }

  stop() {
    if(this.active) {
      cleanupEffect(this)
      if(this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach(dep => dep.delete(effect))
}

export function effect(fn, options = {}) {

  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.onStop = options.onStop
  _effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}