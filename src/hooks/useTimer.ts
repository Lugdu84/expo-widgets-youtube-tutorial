import { useEffect, useRef, useState } from 'react'

export function useTimer(onComplete: () => void) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setIsRunning(false)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft <= 0])

  const start = (durationSeconds: number) => {
    setTimeLeft(durationSeconds)
    setIsRunning(true)
  }

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
    setTimeLeft(0)
  }

  return { timeLeft, isRunning, start, stop, reset }
}
