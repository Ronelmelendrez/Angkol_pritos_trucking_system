/** "Wings" → "Wings (copy)", "Wings (copy)" → "Wings (copy 2)", ... */
export function nextCopyName(name: string): string {
  const match = name.match(/^(.*?)\s*\(copy(?: (\d+))?\)$/i);
  if (!match) return `${name} (copy)`;
  const base = match[1];
  const n = match[2] ? Number(match[2]) + 1 : 2;
  return `${base} (copy ${n})`;
}
