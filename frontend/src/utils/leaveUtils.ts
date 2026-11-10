export function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;

  const start = new Date(from);
  const end = new Date(to);

  const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  return diff > 0 ? diff : 0;
}
