import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePreloader } from '../../contexts/PreloaderContext';

interface ErrorRouteProps {
  children: React.ReactNode;
  errorKey: 'hasServerError' | 'hasSessionExpired';
}

const ErrorRoute = ({ children, errorKey }: ErrorRouteProps) => {
  const preloader = usePreloader();
  
  if (!preloader[errorKey]) {
    // If no error has occurred, redirect to home or login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ErrorRoute;
