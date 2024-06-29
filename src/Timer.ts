import { TransitionCallbacks } from './types'

const FRAME = 16

export default class Timer {

  // ------
  // Lifecycle

  constructor(
    private enabled: boolean = true,
  ) {}

  public get isEnabled() {
    return this.enabled
  }

  public enable() {
    this.enabled = true
  }

  public disable() {
    this.enabled = false
  }

  // ------
  // Properties

  private readonly timeouts:        Set<TimerHandle> = new Set()
  private readonly animationFrames: Set<TimerHandle> = new Set()

  public get isActive() {
    return this.timeouts.size > 0 || this.animationFrames.size > 0
  }

  // ------
  // setTimeout / clearTimeout

  public setTimeout(fn: () => any, ms: number) {
    if (!this.enabled) { return null }

    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout)
      if (this.enabled) {
        fn()
      }
    }, ms)

    this.timeouts.add(timeout)
    return timeout
  }

  public clearTimeout(timeout: number | null) {
    if (timeout == null) { return }
    clearTimeout(timeout)
    this.timeouts.delete(timeout)
  }

  // ------
  // setInterval / clearInterval

  public setInterval(fn: () => any, ms: number) {
    if (!this.enabled) { return null }

    const timeout = setInterval(() => {
      if (this.enabled) {
        fn()
      }
    }, ms)
    this.timeouts.add(timeout)
    return timeout
  }

  public clearInterval(interval: number | null) {
    if (interval == null) { return }
    clearInterval(interval)
    this.timeouts.delete(interval)
  }

  // ------
  // Animation frame

  public requestAnimationFrameAfter(fn: () => any, timeout: number) {
    if (!this.enabled) { return null }
    this.setTimeout(() => {
      this.requestAnimationFrame(fn)
    }, timeout)
  }

  public requestAnimationFrame(fn: () => any) {
    if (!this.enabled) { return null }

    const animationFrame = requestAnimationFrame(() => {
      this.animationFrames.delete(animationFrame)
      if (this.enabled) {
        fn()
      }
    })

    this.animationFrames.add(animationFrame)
    return animationFrame
  }

  public cancelAnimationFrame(animationFrame: number) {
    cancelAnimationFrame(animationFrame)
    this.animationFrames.delete(animationFrame)
  }

  public cancelAllAnimationFrames() {
    for (const animationFrame of this.animationFrames) {
      cancelAnimationFrame(animationFrame)
    }
    this.animationFrames.clear()
  }

  // ------
  // Promises

  public await<T>(promise: PromiseLike<T> | T): Promise<T> {
    // Disable this rule because we correctly catch errors and there's no easy way to do this
    // using the async/await syntax.
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const retval = await promise
        if (this.enabled) {
          resolve(retval)
        }
      } catch (error: any) {
        if (this.enabled) {
          reject(error)
        }
      }
    })
  }

  public then<T, U>(promise: Promise<T>, callback: (result: T) => U): Promise<U | undefined> {
    return promise.then(result => {
      if (this.enabled) { return }
      return callback(result)
    })
  }

  // ------
  // Throttle & debounce

  public throttle(fn: () => any, ms: number) {
    if (!this.isActive) {
      return this.setTimeout(fn, ms)
    }
  }

  public debounce(fn: () => any, ms: number) {
    this.clearAll()
    return this.setTimeout(fn, ms)
  }

  // ------
  // Transitions

  public performTransition(duration: number, transition: TransitionCallbacks) {
    if (!this.enabled) { return }
    if (transition.onPrepare != null) {
      transition.onPrepare()
    }

    if (transition.onCommit != null) {
      this.setTimeout(() => {
        if (this.enabled && transition.onCommit != null) {
          transition.onCommit()
        }
      }, FRAME)
    }

    if (transition.onCleanUp != null) {
      this.setTimeout(() => {
        if (this.enabled && transition.onCleanUp != null) {
          transition.onCleanUp()
        }
      }, FRAME + duration)
    }
  }

  // ------
  // Clear all

  public clearAll() {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout)
    }
    this.timeouts.clear()
  }

}

type TimerHandle = any
