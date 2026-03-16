'use client';

import Lenis from 'lenis';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function useLenis(): Lenis | null {
  // Use a Ref to store the actual instance (prevents cascading renders)
  const lenisRef = useRef<Lenis | null>(null);

  // Use a simple boolean state just to trigger a single re-render once initialized
  const [, setIsReady] = useState(false);

  const isTouchDevice = useMediaQuery({
    query: '(hover: none), (pointer: coarse)',
  });

  useEffect(() => {
    if (isTouchDevice) return;

    // Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    // Store in Ref
    lenisRef.current = lenisInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lenis = lenisInstance;

    // Set ready state - React allows this because it's a primitive update
    // specifically intended to sync the UI with the external system.
    setIsReady(true);

    // GSAP Ticker Synchronization
    const raf = (time: number) => {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);


    return () => {
      lenisInstance.destroy();
      lenisRef.current = null;
      setIsReady(false);
    };
  }, [isTouchDevice]);

  // Return the instance from the Ref
  // eslint-disable-next-line react-hooks/refs
  return lenisRef.current;
}
