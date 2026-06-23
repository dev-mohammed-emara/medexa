import { useState, useEffect } from 'react';

export function useExitAnimation(isShowing: boolean, durationMs: number = 300) {
  const [shouldRender, setShouldRender] = useState(isShowing);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isShowing) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, durationMs);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isShowing, shouldRender, durationMs]);

  return { shouldRender, isExiting };
}
