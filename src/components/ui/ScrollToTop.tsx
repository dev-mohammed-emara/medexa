import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Disable automatic browser scroll restoration to prevent "jumping"
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Snap to top immediately before the browser repaints
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
