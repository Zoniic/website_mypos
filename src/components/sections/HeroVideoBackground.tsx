"use client";

import { useEffect, useRef } from "react";

/**
 * Looping hero background video with a manual fade in/out (rather than a
 * plain hard loop) so the restart isn't jarring. Renders nothing until an
 * admin sets Site Settings > Homepage Hero > background video URL — the
 * gradient/glow background in Hero.tsx is the default.
 */
export function HeroVideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE_MS = 500;
    let raf = 0;

    function fade(direction: "in" | "out", onDone?: () => void) {
      const start = performance.now();
      const from = direction === "in" ? 0 : 1;
      const to = direction === "in" ? 1 : 0;
      function step(now: number) {
        const progress = Math.min((now - start) / FADE_MS, 1);
        if (video) video.style.opacity = String(from + (to - from) * progress);
        if (progress < 1) {
          raf = requestAnimationFrame(step);
        } else {
          onDone?.();
        }
      }
      raf = requestAnimationFrame(step);
    }

    function handlePlay() {
      fade("in");
    }

    function handleTimeUpdate() {
      if (!video) return;
      if (video.duration && video.duration - video.currentTime <= FADE_MS / 1000) {
        fade("out");
      }
    }

    function handleEnded() {
      if (!video) return;
      video.style.opacity = "0";
      window.setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    }

    video.addEventListener("play", handlePlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.play().catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
