"use client"
import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animated section wrapper component
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale" | "fade";
  delay?: number;
}

export const AnimatedSection = ({ 
  children, 
  className = "", 
  animation = "fade-up",
  delay = 0 
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation();

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-700 ease-out";
    const delayClass = delay ? `delay-[${delay}ms]` : "";
    
    const animationMap = {
      "fade-up": isVisible 
        ? "opacity-100 translate-y-0" 
        : "opacity-0 translate-y-8",
      "fade-left": isVisible 
        ? "opacity-100 translate-x-0" 
        : "opacity-0 -translate-x-8",
      "fade-right": isVisible 
        ? "opacity-100 translate-x-0" 
        : "opacity-0 translate-x-8",
      "scale": isVisible 
        ? "opacity-100 scale-100" 
        : "opacity-0 scale-95",
      "fade": isVisible 
        ? "opacity-100" 
        : "opacity-0",
    };

    return `${baseClasses} ${delayClass} ${animationMap[animation]}`;
  };

  return (
    <div 
      ref={ref} 
      className={`${getAnimationClasses()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
