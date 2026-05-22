import { useState, useEffect, useRef } from 'react'

/**
 * Animated counter hook that counts from 0 to `end` over `duration` ms.
 * Returns the current display value as a formatted string.
 */
export const useCountUp = (
  end: number,
  duration: number = 1400,
  startOnMount: boolean = true
): string => {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!startOnMount) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, startOnMount])

  return count.toLocaleString()
}

export default useCountUp
