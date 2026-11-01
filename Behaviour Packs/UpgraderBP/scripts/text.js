// Text helpers: number formats and translated messages (keys live in UpgraderRP/texts).

/** Same as UpgraderScreen.format(long): 9999, 12.3K, 4.5M. */
export function formatValue(value) {
  const v = Math.round(value);
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 10000) return (v / 1000).toFixed(1) + "K";
  return String(v);
}

/** "12.34%" like String.format("%.2f%%"). */
export function formatPercent(chance) {
  return (chance * 100).toFixed(2) + "%";
}

/** RawMessage for a translation key with arguments (strings or RawMessages). */
export function tr(key, ...args) {
  if (!args.length) return { translate: key };
  const plain = args.every((a) => typeof a === "string" || typeof a === "number");
  if (plain) return { translate: key, with: args.map(String) };
  return { translate: key, with: { rawtext: args.map((a) => (typeof a === "object" ? a : { text: String(a) })) } };
}

/** Joins strings and RawMessages into one RawMessage. */
export function raw(...parts) {
  return { rawtext: parts.flat().filter((p) => p !== undefined && p !== null && p !== "").map((p) => (typeof p === "object" ? p : { text: String(p) })) };
}
