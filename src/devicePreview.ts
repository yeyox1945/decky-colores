import { RGB, ZoneGroup } from "./types";
import { rgbToCss } from "./color";

const OFF: RGB = { r: 26, g: 26, b: 32 };
export const SOLID_SEGMENT_GAP_DEGREES = 8;

export function stickSegmentCounts(
  layout: ZoneGroup[] | undefined,
  zones: number,
): [number, number] {
  const sticks = (layout ?? []).filter(
    (group) => group.kind !== "bar" && group.zones.length > 0,
  );
  if (sticks.length >= 2) {
    return [sticks[0].zones.length, sticks[1].zones.length];
  }
  if (zones <= 1) return [1, 1];
  const left = Math.ceil(zones / 2);
  return [left, Math.max(1, zones - left)];
}

export function repeatColor(color: RGB, count: number): RGB[] {
  return Array.from({ length: Math.max(1, count) }, () => color);
}

export function segmentedConic(
  colors: RGB[],
  fromDeg = 0,
  gapDeg = SOLID_SEGMENT_GAP_DEGREES,
): string {
  if (colors.length <= 1) return rgbToCss(colors[0] ?? OFF);
  const n = colors.length;
  const slot = 360 / n;
  const gap = Math.min(Math.max(0, gapDeg), slot - 1);
  const sweep = slot - gap;
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const start = i * slot;
    const end = start + sweep;
    const css = rgbToCss(colors[i]);
    stops.push(`${css} ${start}deg ${end}deg`);
    if (gap > 0) {
      stops.push(`transparent ${end}deg ${start + slot}deg`);
    }
  }
  return `conic-gradient(from ${fromDeg}deg, ${stops.join(", ")})`;
}
