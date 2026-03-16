'use client';

import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

type Listener = {
  wrapper: HTMLElement;
  MouseMove: (e: Event) => void;
  MouseLeave: () => void;
};

const use3DTilt = (selector: string = '.tilt-wrapper') => {
  // 1. Declarative check for hover capability
  const isTouchDevice = useMediaQuery({
    query: '(hover: none), (pointer: coarse)',
  });

  useEffect(() => {
    // 🧠 If it's a touch device, don't attach any listeners
    if (isTouchDevice) return;

    const wrappers = document.querySelectorAll<HTMLElement>(selector);
    const listeners: Listener[] = [];

    wrappers.forEach(wrapper => {
      const card = wrapper.querySelector<HTMLElement>('.tilt');
      if (!card) return;

      const MouseMove = (e: Event) => {
        const event = e as MouseEvent;
        const { left, top, width, height } = wrapper.getBoundingClientRect();

        const x = event.clientX - left;
        const y = event.clientY - top;

        const centeredX = x / width - 0.5;
        const centeredY = y / height - 0.5;

        const rotateX = Math.max(Math.min(centeredY * -45, 45), -45);
        const rotateY = Math.max(Math.min(centeredX * 60, 60), -60);

        const translateZ = -50;
        const translateX = centeredX * 30;
        const translateY = centeredY * 30;

        const innerOverlay = card.querySelector<
          HTMLImageElement | HTMLVideoElement
        >('img, video');

        if (innerOverlay) {
          const posX = 50 + centeredX * 40;
          const posY = 50 + centeredY * 40;
          innerOverlay.style.objectPosition = `${posX}% ${posY}%`;
          innerOverlay.style.willChange = 'object-position';
        }

        card.style.transform = `
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateX(${translateX}px)
          translateY(${translateY}px)
          translateZ(${translateZ}px)
        `;
        // Ensure no transition during active movement for snappiness
        card.style.transition = 'none';
      };

      const MouseLeave = () => {
        card.style.transform =
          'rotateX(0deg) rotateY(0deg) translateX(0) translateY(0) translateZ(0)';
        card.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
      };

      wrapper.addEventListener('mousemove', MouseMove);
      wrapper.addEventListener('mouseleave', MouseLeave);

      listeners.push({ wrapper, MouseMove, MouseLeave });
    });

    return () => {
      listeners.forEach(({ wrapper, MouseMove, MouseLeave }) => {
        wrapper.removeEventListener('mousemove', MouseMove);
        wrapper.removeEventListener('mouseleave', MouseLeave);
      });
    };
  }, [selector, isTouchDevice]); // Re-run if isTouchDevice changes
};

export default use3DTilt;
