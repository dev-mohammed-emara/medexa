  'use client';

  import React, { useEffect, useRef } from 'react';

  interface ScrollLockWrapperProps {
    children: React.ReactNode;
    isActive: boolean;
    onEscape?: () => void; // Added this to fix the TS error
    className?: string;
    style?: React.CSSProperties;
  }

  const ScrollLockWrapper = ({
    children,
    isActive,
    onEscape,
    className,
    style,
  }: ScrollLockWrapperProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const scrollable = containerRef.current;
      if (!scrollable || !isActive) return;

      const handleWheel = (e: WheelEvent) => {
        const delta = e.deltaY;
        const canScrollUp = scrollable.scrollTop > 0;
        const canScrollDown =
          scrollable.scrollTop + scrollable.clientHeight <
          scrollable.scrollHeight;

        if ((delta < 0 && canScrollUp) || (delta > 0 && canScrollDown)) {
          e.stopPropagation();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
      };

      scrollable.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        scrollable.removeEventListener('wheel', handleWheel);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isActive, onEscape]);

    return (
      <div ref={containerRef} className={`scrollable ${className}`} style={style}>
        {children}
      </div>
    );
  };

  export default ScrollLockWrapper;
