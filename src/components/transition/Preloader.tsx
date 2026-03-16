import gsap from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { usePreloader } from '../../context/PreloaderContext';

const Preloader = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { setIsLoaded, setIsExiting } = usePreloader();

  const topBoxes = useRef<(HTMLDivElement | null)[]>([]);
  const bottomBoxes = useRef<(HTMLDivElement | null)[]>([]);

  const ease = "expo.inOut";

  // Use a ref to track the master timeline to prevent clashing
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const revealTransition = useCallback(() => {
    // Kill any existing timeline before starting a new one
    if (masterTl.current) {
      masterTl.current.kill();
    }

    gsap.set(loaderRef.current, { display: 'flex', pointerEvents: 'all' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(loaderRef.current, { display: 'none', pointerEvents: 'none' });
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
    }, "<")
    .call(() => {
      setIsLoaded(true);
      setIsExiting(false);
    }, [], "-=0.5");

  }, [setIsLoaded, setIsExiting, ease]);

  const closeTransition = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (masterTl.current) masterTl.current.kill();

      setIsLoaded(false);
      setIsExiting(true);
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
    // No redundant useEffect needed after this
  }, [location.pathname, language, revealTransition]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-99999999 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Top Row */}
        <div className="flex flex-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={`top-${i}`}
              ref={(el) => { topBoxes.current[i] = el; }}
              className={`bg-[#0B1120] will-change-transform
                ${i === 0 ? 'flex-1 md:flex-initial md:w-1/4' : 'hidden md:block md:flex-1'}`}
            />
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={`bottom-${i}`}
              ref={(el) => { bottomBoxes.current[i] = el; }}
              className={`bg-[#0B1120] will-change-transform
                ${i === 0 ? 'flex-1 md:flex-initial md:w-1/4' : 'hidden md:block md:flex-1'}`}
            />
          ))}
        </div>
      </div>

      {/* Logo Overlay */}
      <div ref={logoRef} className="relative z-10 flex flex-col items-center px-6">
        <div className="w-48 h-34 md:w-64 md:h-48 flex items-center justify-center">
          <img src="/images/logo.avif" alt="logo" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
