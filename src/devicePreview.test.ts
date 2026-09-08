import { describe, expect, it } from "vitest";

import {
  repeatColor,
  segmentedConic,
  stickSegmentCounts,
} from "./devicePreview";
import { ZoneGroup } from "./types";

const red = { r: 255, g: 0, b: 0 };

const sticks = (left: number, right: number): ZoneGroup[] => [
  { name: "Left stick", region: [], zones: Array.from({ length: left }, (_, i) => i) },
  {
    name: "Right stick",
    region: [],
    zones: Array.from({ length: right }, (_, i) => left + i),
  },
];

describe("stickSegmentCounts", () => {
  it("uses layout zone lists for each stick", () => {
    expect(stickSegmentCounts(sticks(2, 2), 4)).toEqual([2, 2]);
    expect(stickSegmentCounts(sticks(1, 1), 2)).toEqual([1, 1]);
  });

  it("mirrors a single zone onto both sticks", () => {
    expect(stickSegmentCounts([], 1)).toEqual([1, 1]);
  });

  it("splits evenly when layout is missing", () => {
    expect(stickSegmentCounts(undefined, 4)).toEqual([2, 2]);
    expect(stickSegmentCounts([], 9)).toEqual([5, 4]);
  });
});

describe("segmentedConic", () => {
  it("keeps a single color as a flat fill", () => {
    expect(segmentedConic([red])).toBe("rgb(255, 0, 0)");
  });

  it("paints hard sectors with a transparent gap and no wrap blend", () => {
    const css = segmentedConic([red, red], 0, 8);
    expect(css).toBe(
      "conic-gradient(from 0deg, rgb(255, 0, 0) 0deg 172deg, transparent 172deg 180deg, rgb(255, 0, 0) 180deg 352deg, transparent 352deg 360deg)",
    );
    expect(css).not.toContain("360deg, rgb");
  });
});

describe("repeatColor", () => {
  it("fills one slot per stick LED", () => {
    expect(repeatColor(red, 2)).toEqual([red, red]);
  });
});
