import React from 'react'

import Timer from './Timer'

export default function useTimer() {
  const timer = React.useMemo(() => new Timer(false), [])

  React.useEffect(() => {
    timer.enable()
    return () => { timer.disable() }
  }, [timer])

  return timer
}
