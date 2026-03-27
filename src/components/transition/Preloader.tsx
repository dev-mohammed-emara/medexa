import { usePreloader } from '@/contexts/PreloaderContext';
import gsap from 'gsap';
import nProgress from 'nprogress';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from 'react-router-dom';

const Preloader = () => {
  const location = useLocation();
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { setIsLoaded, setIsExiting } = usePreloader();

  const ease = "expo.inOut";
  const darkPrimary = "#052c46";
  const lastUrlRef = useRef(window.location.href);

  // Use a ref to track the master timeline to prevent clashing
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  // Determine box count based on device. 1 for desktop, 4 for mobile.
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const boxCount = isDesktop ? 4 : 1;

  const revealTransition = useCallback(() => {
    if (masterTl.current) masterTl.current.kill();

    nProgress.start();
    
    // Ensure display is flex BEFORE starting animation
    gsap.set(loaderRef.current, { display: 'flex', pointerEvents: 'all' });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(loaderRef.current, { display: 'none', pointerEvents: 'none' });
        setIsLoaded(true);
        setIsExiting(false);
      }
    });

    masterTl.current = tl;

    const activeTopBoxes = Array.from(loaderRef.current?.querySelectorAll('.top-box-animate') || []);
    const activeBottomBoxes = Array.from(loaderRef.current?.querySelectorAll('.bottom-box-animate') || []);

    // If boxes are not at original position (0), snap them to 0 first (mostly for popstate)
    // We animatethe transition FROM 0 to -101/101
    tl.set([activeTopBoxes, activeBottomBoxes], { yPercent: 0 })
      .set(logoRef.current, { y: 0, opacity: 1 })
      .to(logoRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        delay: 0.2 // Small delay to show the cover before revealing
      })
      .to(activeTopBoxes, {
        yPercent: -101,
        stagger: 0.04,
        duration: 1.2,
        ease: ease
      }, "-=0.5")
      .to(activeBottomBoxes, {
        yPercent: 101,
        stagger: 0.04,
        duration: 1.2,
        ease: ease
      }, "<")
      .add(() => {
        setIsLoaded(true);
        nProgress.done();
      }, "-=0.8");

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

      const activeTopBoxes = Array.from(loaderRef.current?.querySelectorAll('.top-box-animate') || []);
      const activeBottomBoxes = Array.from(loaderRef.current?.querySelectorAll('.bottom-box-animate') || []);

      tl.fromTo(activeTopBoxes,
        { yPercent: -101 },
        { yPercent: 0, stagger: 0.04, duration: 0.8, ease: ease }
      )
      .fromTo(activeBottomBoxes,
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

  useEffect(() => {
    lastUrlRef.current = window.location.href;
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePopState = () => {
      // If URL hasn't changed, it's likely a modal closure or hash change - don't show preloader
      if (window.location.href === lastUrlRef.current) return;
      lastUrlRef.current = window.location.href;

      // Force cover screen immediately on popstate
      if (loaderRef.current) {
        setIsLoaded(false);
        setIsExiting(true);
        gsap.set(loaderRef.current, { display: 'flex', pointerEvents: 'all' });
        const boxes = loaderRef.current.querySelectorAll('.top-box-animate, .bottom-box-animate');
        gsap.set(boxes, { yPercent: 0 });
        gsap.set(logoRef.current, { y: 0, opacity: 1 });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setIsLoaded, setIsExiting]);

  useLayoutEffect(() => {
    revealTransition();
  }, [location.pathname, revealTransition]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 max-w-screen max-h-screen h-screen w-screen z-99999999 flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Top Row */}
        <div className="flex flex-1">
          {Array.from({ length: boxCount }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 will-change-transform top-box-animate"
              style={{ backgroundColor: darkPrimary }}
            />
          ))}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-1">
          {Array.from({ length: boxCount }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="flex-1 will-change-transform bottom-box-animate"
              style={{ backgroundColor: darkPrimary }}
            />
          ))}
        </div>
      </div>

      {/* Logo Overlay */}
      <div ref={logoRef} className="relative z-10 flex flex-col items-center px-6">
        <div className="flex flex-col items-center justify-center">
          <img src="/images/logo.png" alt="Medexa Logo" className="h-28 md:h-48 w-auto mb-6 object-contain " />
          <div className="h-1 w-48 bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white w-1/3 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
