import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Don't forget to import the CSS!

export default function PageLoader() {
  const location = useLocation();

  useEffect(() => {
    // Start the progress bar when the location changes
    nProgress.start();

    // Complete the progress bar after the component "mounts" with the new location
    nProgress.done();

    return () => {
      // Clean up on unmount
      nProgress.remove();
    };
  }, [location]);

  return null;
}
