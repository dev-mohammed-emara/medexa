
import React, { useEffect, useRef } from 'react';

interface ScrollLockWrapperProps {
  children: React.ReactNode;
  isActive?: boolean;
  onEscape?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ScrollLockWrapper = ({
  children,
  isActive = true,
  onEscape,
  className = '',
  style,
}: ScrollLockWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollable = containerRef.current;
    if (!scrollable || !isActive) return;

    // Global Modal Error Auto-Scroll
    // Automatically scroll to top if an error element is added inside the modal
    const observer = new MutationObserver((mutations) => {
      let shouldScroll = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const hasError = Array.from(mutation.addedNodes).some(node => {
            if (node instanceof HTMLElement) {
              return node.classList.contains('text-destructive') || node.querySelector('.text-destructive');
            }
            return false;
          });
          if (hasError) {
            shouldScroll = true;
            break;
          }
        }
      }
      if (shouldScroll) {
        scrollable.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    observer.observe(scrollable, { childList: true, subtree: true });

    const handleWheel = (e: WheelEvent) => {
      // Allow browser to handle native scrolling by stopping propagation only
      // if it would cause the parent to scroll (overscroll).
      const delta = e.deltaY;
      const canScrollUp = scrollable.scrollTop > 0;
      const canScrollDown =
        scrollable.scrollTop + scrollable.clientHeight <
        scrollable.scrollHeight;

      if (delta < 0 && !canScrollUp) return;
      if (delta > 0 && !canScrollDown) return;
      
      e.stopPropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    scrollable.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      scrollable.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);

  return (
    <div
      ref={containerRef}
      className={`scrollable ${className}`}
      style={{ overscrollBehavior: 'contain', ...style }}
    >
      {children}
    </div>
  );
};

export default ScrollLockWrapper;
