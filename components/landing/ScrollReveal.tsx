'use client';

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
};

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // MASUK VIEWPORT
          setIsVisible(true);
        } else {
          // KELUAR VIEWPORT
          // reset supaya nanti bisa animasi lagi
          setIsVisible(false);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hiddenTransform = {
    up: 'translateY(32px)',
    left: 'translateX(-32px)',
    right: 'translateX(32px)',
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,

        transform: isVisible
          ? 'translate3d(0, 0, 0)'
          : hiddenTransform[direction],

        transitionProperty: 'opacity, transform',

        transitionDuration: '700ms',

        transitionTimingFunction:
          'cubic-bezier(0.22, 1, 0.36, 1)',

        transitionDelay: isVisible
          ? `${delay}ms`
          : '0ms',

        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}