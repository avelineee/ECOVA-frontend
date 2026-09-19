'use client';

import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
};

export default function CountUp({
  value,
  duration = 1400,
  decimals = 0,
  suffix = '',
}: CountUpProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const startAnimation = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      setDisplayValue(0);

      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        const progress = Math.min(
          elapsed / duration,
          1
        );

        // Awalnya cepat, lalu pelan saat mendekati angka akhir
        const eased =
          1 - Math.pow(1 - progress, 3);

        const currentValue = value * eased;

        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current =
            requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          animationRef.current = null;
        }
      };

      animationRef.current =
        requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          if (animationRef.current !== null) {
            cancelAnimationFrame(
              animationRef.current
            );

            animationRef.current = null;
          }

          setDisplayValue(0);
        }
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (animationRef.current !== null) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [value, duration]);

  return (
    <span ref={containerRef}>
      {displayValue.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}