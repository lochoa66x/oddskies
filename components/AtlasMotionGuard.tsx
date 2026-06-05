"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function AtlasMotionGuard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
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
        syncMotion(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(element);

    const handleMotionChange = () => syncMotion();

    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div
      className={`${className} ${pauseMotion ? "atlas-motion-paused" : ""}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
