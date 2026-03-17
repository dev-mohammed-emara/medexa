import { gsap } from 'gsap';
import React, { useEffect, useRef } from 'react';

interface RollingDigitProps {
  value: number;
  height: number;
  isInView: boolean;
  delay: number;
}

const RollingDigit = ({ value, height, isInView, delay }: RollingDigitProps) => {
  const columnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) {
      // Use value + 10 to shift into the second set of [0-9] for the rolling effect
      const endY = -(value + 10) * height;

      gsap.fromTo(
        columnRef.current,
        { y: 0 },
        {
          y: endY,
          duration: 2.5,
          delay: delay,
          ease: 'power4.inOut',
        }
      );
    } else {
      gsap.to(columnRef.current, {
        y: 0,
        duration: 0.5,
      });
    }
  }, [isInView, value, height, delay]);

  return (
    <span className="relative flex flex-col will-change-transform" ref={columnRef} style={{ height }}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, idx) => (
        <span
          key={idx}
          className="flex items-center  justify-center"
          style={{ height, width: '1ch' }}
        >
          {num}
        </span>
      ))}
    </span>
  );
};

interface CounterProps {
  value: number;
  fontSize?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  containerClass?: string;
  isInView: boolean;
  isCurrency?: boolean;
}

export default function Counter({
  value,
  fontSize = 100,
  textColor = 'inherit',
  fontWeight = 'bold',
  containerClass = '',
  isInView,
  isCurrency = false,
}: CounterProps) {
  const height = fontSize * 1.2;

  // For currency/floats, we might want to handle it differently
  // If isCurrency, we'll force 2 decimal places.
  const formattedValue = isCurrency
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : new Intl.NumberFormat('en-US').format(value);

  const digits = formattedValue.split('');

  return (
    <span
      className={`relative inline-flex flex-row items-center overflow-hidden ${containerClass}`}
      dir="ltr"
      style={{ height, fontSize, color: textColor, fontWeight, lineHeight: 1.2, letterSpacing: '0em' }}
    >
      {digits.map((char, index) => {
        if (char === '.') return <span key={index} className="flex items-center justify-center" style={{ width: '0.3ch', height }}>.</span>;
        if (char === ',') return <span key={index} className="flex items-center justify-center" style={{ width: '0.3ch', height }}>,</span>;

        return (
          <div key={index} className="relative overflow-hidden -mx-px " style={{ height, width: '1ch' }}>
            <RollingDigit
              value={parseInt(char)}
              height={height}
              isInView={isInView}
              delay={index * 0.1}
            />
          </div>
        );
      })}
    </span>
  );
}
