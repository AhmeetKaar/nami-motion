import { useEffect, useRef, useState } from "react";

type DemoVideoProps = {
  slug: string;
  title: string;
  mode: "hover" | "autoplay";
  className?: string;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DemoVideo({ slug, title, mode, className = "" }: DemoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    if (mode === "autoplay") {
      video.play().catch(() => {});
      return;
    }
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [mode, reduced]);

  const play = () => {
    if (mode === "hover" && !reduced) ref.current?.play().catch(() => {});
  };
  const pause = () => {
    if (mode === "hover") ref.current?.pause();
  };

  return (
    <video
      ref={ref}
      src={`/videos/${slug}.mp4`}
      poster={`/posters/${slug}.jpg`}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`${title} recording`}
      controls={mode === "autoplay" && reduced}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
      className={`block h-full w-full object-cover ${className}`}
    />
  );
}
