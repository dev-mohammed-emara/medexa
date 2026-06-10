'use client';

import Lenis from 'lenis';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function useLenis(): Lenis | null {
  const [lenis, setLenis] = useState<Lenis | null>(null);

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

    setLenis(lenisInstance);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lenis = lenisInstance;

    // GSAP Ticker Synchronization
    let active = true;
    const raf = (time: number) => {
      if (!active) return;
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      active = false;
      lenisInstance.destroy();
      setLenis(null);
    };
  }, [isTouchDevice]);

  return lenis;
}
