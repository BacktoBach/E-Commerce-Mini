import { useEffect, useState } from "react";

function secondsUntil(endAt: number): number {
  return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
}

export function useCountdown(initialEndAt: number) {
  const [endAt, setEndAt] = useState(initialEndAt);
  const [seconds, setSeconds] = useState(() => secondsUntil(initialEndAt));

  useEffect(() => {
    setSeconds(secondsUntil(endAt));
    const intervalId = globalThis.setInterval(() => setSeconds(secondsUntil(endAt)), 1_000);
    return () => globalThis.clearInterval(intervalId);
  }, [endAt]);

  const restart = (durationSeconds: number) => {
    setEndAt(Date.now() + durationSeconds * 1_000);
  };

  return {
    seconds,
    restart
  };
}
