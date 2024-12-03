import React from 'react'
import Timer from './Timer'

export default function useTimer() {
  const timer = React.useMemo(() => new Timer(), [])

  React.useEffect(
    () => () => { timer.disable() },
    [timer]
  )

  return timer
}
