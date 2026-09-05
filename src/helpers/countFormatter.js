export function countFormatter(count, decimals = 1) {
  if (count === null || count === undefined || isNaN(count)) return "0";
  if (Math.abs(count) < 1000) return count.toString();

  const units = ["", "k", "m", "b", "t"];
  const i = Math.floor(Math.log10(Math.abs(count)) / 3);
  
  const unitIndex = Math.min(i, units.length - 1);
  const scaled = count / Math.pow(10, unitIndex * 3);

  const formatted = Number(scaled.toFixed(decimals)).toString();

  return `${formatted}${units[unitIndex]}`;
}