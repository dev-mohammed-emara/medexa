import React, { forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// We extend standard Anchor attributes but omit 'href'
// so we can redefine it as a required string.
interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string; // Only href is mandatory
  children?: React.ReactNode;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, children, className, onClick, ...props }, ref) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Execute original onClick if it exists
      if (onClick) onClick(e);

      // Prevent default browser navigation
      e.preventDefault();

      // Avoid redundant animations if already on the destination
      if (location.pathname === href) return;

      // 1. Trigger the "Close" animation from global window object
      if (window.triggerExitTransition) {
        try {
          await window.triggerExitTransition();
        } catch (error) {
          console.error("Transition failed:", error);
        }
      }

      // 2. Navigate to the new path
      navigate(href);
    };

    return (
      <a
        {...props}
        ref={ref}
        href={href}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }
);

TransitionLink.displayName = 'TransitionLink';
