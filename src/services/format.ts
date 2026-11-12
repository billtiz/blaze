/** Small typed helpers shared by future BlaZe maintenance tooling. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function safeLabel(value: string, maxLength = 80): string {
  return value.replace(/[\r\n\t]/g, ' ').trim().slice(0, Math.max(1, maxLength));
}
