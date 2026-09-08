import { RGB, ZoneGroup } from "./types";
import { expandGradient, rgbToCss } from "./color";

const OFF: RGB = { r: 26, g: 26, b: 32 };
export const SEGMENT_GAP_DEGREES = 8;

export function stickGroups(layout: ZoneGroup[] | undefined): ZoneGroup[] {
  return (layout ?? []).filter(
    (group) => group.kind !== "bar" && group.zones.length > 0,
  );
}

export function repeatColor(color: RGB, count: number): RGB[] {
  return Array.from({ length: Math.max(1, count) }, () => color);
}

export function zoneFrame(colors: RGB[], zones: number): RGB[] {
  const n = Math.max(1, zones);
  const fill = colors[0] ?? OFF;
  if (colors.length <= 1) return repeatColor(fill, n);
  return expandGradient(colors, n);
}

export function splitStickColors(
  frame: RGB[],
  layout: ZoneGroup[] | undefined,
): [RGB[], RGB[]] {
  const sticks = stickGroups(layout);
  if (sticks.length >= 2) {
    const pick = (zones: number[]) =>
      zones.map((index) => frame[index] ?? frame[frame.length - 1] ?? OFF);
    const left = pick(sticks[0].zones);
    const right = pick(sticks[1].zones);
    return [left.length ? left : [OFF], right.length ? right : [OFF]];
  }
  if (frame.length <= 1) {
    const color = frame[0] ?? OFF;
    return [[color], [color]];
  }
  const left = Math.ceil(frame.length / 2);
  return [frame.slice(0, left), frame.slice(left)];
}

export function zonedStickColors(
  colors: RGB[],
  layout: ZoneGroup[] | undefined,
  zones: number,
): [RGB[], RGB[]] {
  return splitStickColors(zoneFrame(colors, zones), layout);
}

export function segmentedConic(
  colors: RGB[],
  fromDeg = 0,
  gapDeg = SEGMENT_GAP_DEGREES,
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
