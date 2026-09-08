import { describe, expect, it } from "vitest";

import { expandGradient } from "./color";
import {
  segmentedConic,
  splitStickColors,
  zoneFrame,
  zonedStickColors,
} from "./devicePreview";
import { ZoneGroup } from "./types";

const red = { r: 255, g: 0, b: 0 };
const blue = { r: 0, g: 0, b: 255 };

const sticks = (left: number, right: number): ZoneGroup[] => [
  { name: "Left stick", region: [], zones: Array.from({ length: left }, (_, i) => i) },
  {
    name: "Right stick",
    region: [],
    zones: Array.from({ length: right }, (_, i) => left + i),
  },
];

describe("zoneFrame", () => {
  it("repeats a solid color across every zone", () => {
    expect(zoneFrame([red], 4)).toEqual([red, red, red, red]);
  });

  it("interpolates gradient stops across all zones like the backend", () => {
    expect(zoneFrame([red, blue], 4)).toEqual(expandGradient([red, blue], 4));
    expect(zoneFrame([red, blue], 4)).toEqual([
      red,
      { r: 170, g: 0, b: 85 },
      { r: 85, g: 0, b: 170 },
      blue,
    ]);
  });
});

describe("splitStickColors", () => {
  it("uses layout zone indices instead of splitting the stop list", () => {
    const frame = [red, { r: 1, g: 0, b: 0 }, { r: 0, g: 0, b: 1 }, blue];
    expect(splitStickColors(frame, sticks(2, 2))).toEqual([
      [red, { r: 1, g: 0, b: 0 }],
      [{ r: 0, g: 0, b: 1 }, blue],
    ]);
  });

  it("mirrors a single zone onto both sticks", () => {
    expect(splitStickColors([red], [])).toEqual([[red], [red]]);
  });
});

describe("zonedStickColors", () => {
  it("maps a two-stop gradient onto four stick LEDs", () => {
    expect(zonedStickColors([red, blue], sticks(2, 2), 4)).toEqual([
      [red, { r: 170, g: 0, b: 85 }],
      [{ r: 85, g: 0, b: 170 }, blue],
    ]);
  });

  it("gives each Legion stick one interpolated endpoint", () => {
    expect(zonedStickColors([red, blue], sticks(1, 1), 2)).toEqual([[red], [blue]]);
  });
});

describe("segmentedConic", () => {
  it("keeps a single color as a flat fill", () => {
    expect(segmentedConic([red])).toBe("rgb(255, 0, 0)");
  });

  it("paints hard sectors with a transparent gap and no wrap blend", () => {
    const css = segmentedConic([red, blue], 0, 8);
    expect(css).toBe(
      "conic-gradient(from 0deg, rgb(255, 0, 0) 0deg 172deg, transparent 172deg 180deg, rgb(0, 0, 255) 180deg 352deg, transparent 352deg 360deg)",
    );
    expect(css).not.toContain("360deg, rgb");
  });
});
