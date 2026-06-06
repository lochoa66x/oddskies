"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function AtlasMotionGuard({
  children,
  className = "",
  pausedClassName = "atlas-motion-paused",
  rootMargin = "0px 0px -12% 0px",
}: {
  children: ReactNode;
  className?: string;
  pausedClassName?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [pauseMotion, setPauseMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncMotion(visible = visibleRef.current) {
      visibleRef.current = visible;
      setPauseMotion(motionQuery.matches || !visible);
    }

    syncMotion();

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncMotion(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0));
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(element);

    const handleMotionChange = () => syncMotion();

    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [rootMargin]);

  return (
    <div
      className={`${className} ${pauseMotion ? pausedClassName : ""}`}
      data-motion-paused={pauseMotion ? "true" : "false"}
      ref={ref}
    >
      {children}
    </div>
  );
}
