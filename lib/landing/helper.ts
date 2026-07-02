export const TARGET_DATE = ({
  date,
  month,
  year,
}: {
  date: number;
  month: number;
  year: number;
}) => {
  const mm = String(month).padStart(2, "0");
  const dd = String(date).padStart(2, "0");

  return new Date(`${year}-${mm}-${dd}T00:00:00+07:00`).getTime();
};

export const timeBlocks: { key: keyof ReturnType<typeof calculateTimeLeft>; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
]

export function calculateTimeLeft(TARGET_DATE: number) {
  const now = Date.now()
  const difference = TARGET_DATE - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}