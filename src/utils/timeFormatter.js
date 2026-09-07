export function timeFormatter(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const { label, seconds: unitSeconds } of intervals) {
    const count = Math.floor(seconds / unitSeconds);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}