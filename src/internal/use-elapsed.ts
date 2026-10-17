import { useEffect, useState } from "react";

export function useElapsed(startedAt: number | undefined, running: boolean, interval = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running || startedAt === undefined) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval, running, startedAt]);

  if (startedAt === undefined) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

export function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}:${String(rest).padStart(2, "0")}` : `${rest}s`;
}
