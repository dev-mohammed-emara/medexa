import { usePreloader } from '@/contexts/PreloaderContext';
import gsap from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import nProgress from 'nprogress';

const Preloader = () => {
  const location = useLocation();
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { setIsLoaded, setIsExiting } = usePreloader();

  const topBoxes = useRef<(HTMLDivElement | null)[]>([]);
  const bottomBoxes = useRef<(HTMLDivElement | null)[]>([]);

  const ease = "expo.inOut";
  const accentColor = "#3FB8AF"; // Using accent color as requested

  // Use a ref to track the master timeline to prevent clashing
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const revealTransition = useCallback(() => {
    // Kill any existing timeline before starting a new one
    if (masterTl.current) {
      masterTl.current.kill();
    }

    nProgress.start();
    gsap.set(loaderRef.current, { display: 'flex', pointerEvents: 'all' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(loaderRef.current, { display: 'none', pointerEvents: 'none' });
        setIsLoaded(true);
        setIsExiting(false);
        nProgress.done();
      }
    });

    masterTl.current = tl;

    tl.to(logoRef.current, {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in"
    })
    .to(topBoxes.current, {
      yPercent: -101,
      stagger: 0.04,
      duration: 1.2,
      ease: ease
    }, "-=0.5")
    .to(bottomBoxes.current, {
      yPercent: 101,
      stagger: 0.04,
      duration: 1.2,
      ease: ease
    }, "<");

  }, [setIsLoaded, setIsExiting, ease]);

  const closeTransition = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (masterTl.current) masterTl.current.kill();

      setIsLoaded(false);
      setIsExiting(true);
      nProgress.start();
      gsap.set(loaderRef.current, { display: 'flex', pointerEvents: 'all' });

      const tl = gsap.timeline({
        onComplete: () => resolve()
      });

      masterTl.current = tl;

      tl.fromTo(topBoxes.current,
        { yPercent: -101 },
        { yPercent: 0, stagger: 0.04, duration: 0.8, ease: ease }
      )
      .fromTo(bottomBoxes.current,
        { yPercent: 101 },
        { yPercent: 0, stagger: 0.04, duration: 0.8, ease: ease },
        "<"
      )
      .fromTo(logoRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
    });
  }, [setIsLoaded, setIsExiting, ease]);

  useEffect(() => {
    window.triggerExitTransition = closeTransition;
  }, [closeTransition]);

  // Handle first mount and subsequent route/language changes
  useLayoutEffect(() => {
    revealTransition();
  }, [location.pathname, revealTransition]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-99999999 flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Top Row */}
        <div className="flex flex-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={`top-${i}`}
              ref={(el) => { topBoxes.current[i] = el; }}
              className="flex-1 will-change-transform"
              style={{ backgroundColor: accentColor }}
            />
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={`bottom-${i}`}
              ref={(el) => { bottomBoxes.current[i] = el; }}
              className="flex-1 will-change-transform"
              style={{ backgroundColor: accentColor }}
            />
          ))}
        </div>
      </div>

      {/* Logo Overlay */}
      <div ref={logoRef} className="relative z-10 flex flex-col items-center px-6">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-widest uppercase mb-2">Medexa</h2>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white w-1/3 animate-[shimmer_2s_infinite]" />
          </div>
          <p className="text-white/60 text-sm md:text-base mt-4 font-medium tracking-[0.3em] uppercase">Healthcare Systems</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
