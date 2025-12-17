export interface TransitionCallbacks {
  onPrepare?: () => void
  onCommit?:  () => void
  onCleanUp?: () => void
}
