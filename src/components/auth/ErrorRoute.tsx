import React from 'react';

interface ErrorRouteProps {
  children: React.ReactNode;
}

const ErrorRoute = ({ children }: ErrorRouteProps) => {
  return <>{children}</>;
};

export default ErrorRoute;
