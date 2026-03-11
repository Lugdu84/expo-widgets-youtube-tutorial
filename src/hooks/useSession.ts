import { useState } from 'react'

import { useTimer } from './useTimer'

type Duration = 15 | 25 | 45

export function useSession() {
  const [task, setTask] = useState('')
  const [duration, setDuration] = useState<Duration>(25)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const onComplete = () => {
    // TODO: live activity — instance.end()
    // TODO: widget — FocusWidget.updateSnapshot({ task, duration, isActive: false })
    setIsActive(false)
    setIsCompleted(true)
  }

  const { timeLeft, start, stop, reset } = useTimer(onComplete)

  const startSession = () => {
    // TODO: widget — FocusWidget.updateSnapshot({ task, duration, isActive: true })
    // TODO: live activity — FocusActivity.start({ task, endTime })
    setIsCompleted(false)
    setIsActive(true)
    start(duration * 60)
  }

  const stopSession = () => {
    // TODO: widget — FocusWidget.updateSnapshot({ task, duration, isActive: false })
    // TODO: live activity — instance.end()
    stop()
    setIsActive(false)
  }

  const clearCompleted = () => {
    setIsCompleted(false)
  }

  return {
    task,
    setTask,
    duration,
    setDuration,
    isActive,
    isCompleted,
    timeLeft,
    startSession,
    stopSession,
    clearCompleted,
  }
}
