export function countFormatter(count, decimals = 1) {
  if (count === null || count === undefined || isNaN(count)) return "0";
  if (Math.abs(count) < 1000) return count.toString();

  const units = ["", "k", "m", "b", "t"];
  let unitIndex = Math.floor(Math.log10(Math.abs(count)) / 3);
  let scaled = count / Math.pow(10, unitIndex * 3);

  if (scaled >= 1000 && unitIndex < units.length - 1) {
    unitIndex += 1;
    scaled = count / Math.pow(10, unitIndex * 3);
  }

  unitIndex = Math.min(unitIndex, units.length - 1);
  const formatted = Number(scaled.toFixed(decimals)).toString();

  return `${formatted}${units[unitIndex]}`;
}
