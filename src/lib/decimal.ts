/** Fixed point helpers for display and safe exact decimal operations. Never convert authoritative values to JS Number. */
export function decimalAdd(a: string, b: string): string {
  const scale = Math.max(frac(a), frac(b));
  const [ai, bi] = [toBig(a, scale), toBig(b, scale)];
  return fromBig(ai + bi, scale);
}
export function decimalSubtract(a: string, b: string): string {
  return decimalAdd(a, `-${b}`);
}
function frac(s: string) {
  return (s.split(".")[1] || "").length;
}
function toBig(s: string, n: number) {
  const neg = s.startsWith("-");
  const v = s.replace("-", "");
  const [w, f = ""] = v.split(".");
  const out =
    BigInt(w || "0") * BigInt(10) ** BigInt(n) +
    BigInt((f + "0".repeat(n)).slice(0, n) || "0");
  return neg ? -out : out;
}
function fromBig(v: bigint, n: number) {
  const neg = v < BigInt(0) ? "−" : "";
  const raw = (v < BigInt(0) ? -v : v).toString().padStart(n + 1, "0");
  if (!n) return neg + raw;
  const frac = raw.slice(-n).replace(/0+$/, "");
  return `${neg}${raw.slice(0, -n)}${frac ? "." + frac : ""}`;
}
