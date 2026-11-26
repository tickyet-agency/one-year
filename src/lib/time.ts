import { useEffect, useState } from "react";
import { content } from "../content";

/** Re-renders every second with the current time. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const startDate = new Date(content.startDate);

const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

/** Years, months, days, hours, minutes, seconds since the start date. */
export function together(now: Date) {
  let months = 0;
  while (addMonths(startDate, months + 1) <= now) months++;
  const anchor = addMonths(startDate, months);
  let rest = Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / 1000));
  const days = Math.floor(rest / 86400); rest %= 86400;
  const hours = Math.floor(rest / 3600); rest %= 3600;
  return { years: Math.floor(months / 12), months: months % 12, days, hours, minutes: Math.floor(rest / 60), seconds: rest % 60 };
}

export const daysTogether = (now: Date) => Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 86400000));

/** The countdown to the first meeting, as one sentence. */
export function meetLine(now: Date) {
  if (!content.meetDate) return "Next chapter: the day we finally meet.";
  const left = Math.floor((new Date(content.meetDate).getTime() - now.getTime()) / 1000);
  if (left <= 0) return "We finally met. Best day ever.";
  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  return `${d} days, ${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s until I finally get to hug you`;
}
