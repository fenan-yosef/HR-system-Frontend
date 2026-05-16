import { describe, expect, it } from "vitest";
import {
  pad,
  getDateKey,
  formatDateLabel,
  formatMinutes,
  differenceInMinutes,
  getWeekDates,
} from "@/lib/utils-date";

describe("utils-date", () => {
  describe("pad", () => {
    it("should pad single digit numbers with leading zero", () => {
      expect(pad(5)).toBe("05");
      expect(pad(0)).toBe("00");
      expect(pad(9)).toBe("09");
    });

    it("should not pad double digit numbers", () => {
      expect(pad(10)).toBe("10");
      expect(pad(42)).toBe("42");
      expect(pad(99)).toBe("99");
    });
  });

  describe("getDateKey", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date(Date.UTC(2024, 0, 15)); // January 15, 2024
      const key = getDateKey(date);
      expect(key).toBe("2024-01-15");
    });

    it("should pad month and day with zeros", () => {
      const date = new Date(Date.UTC(2024, 3, 5)); // April 5, 2024
      const key = getDateKey(date);
      expect(key).toBe("2024-04-05");
    });

    it("should handle year boundaries", () => {
      const date = new Date(Date.UTC(2025, 11, 31)); // December 31, 2025
      const key = getDateKey(date);
      expect(key).toBe("2025-12-31");
    });
  });

  describe("formatDateLabel", () => {
    it("should format date key to readable label", () => {
      const label = formatDateLabel("2024-01-15");
      expect(label).toContain("Jan");
      expect(label).toContain("15");
      expect(label).toContain("2024");
    });

    it("should handle different months", () => {
      const labels = [
        formatDateLabel("2024-01-01"),
        formatDateLabel("2024-06-15"),
        formatDateLabel("2024-12-31"),
      ];

      expect(labels[0]).toContain("Jan");
      expect(labels[1]).toContain("Jun");
      expect(labels[2]).toContain("Dec");
    });

    it("should format dates consistently", () => {
      const label1 = formatDateLabel("2024-03-10");
      const label2 = formatDateLabel("2024-03-10");
      expect(label1).toBe(label2);
    });
  });

  describe("formatMinutes", () => {
    it("should format minutes as hours and minutes", () => {
      expect(formatMinutes(0)).toBe("00h 00m");
      expect(formatMinutes(30)).toBe("00h 30m");
      expect(formatMinutes(60)).toBe("01h 00m");
      expect(formatMinutes(90)).toBe("01h 30m");
    });

    it("should pad with zeros", () => {
      expect(formatMinutes(5)).toBe("00h 05m");
      expect(formatMinutes(75)).toBe("01h 15m");
    });

    it("should handle large minute values", () => {
      expect(formatMinutes(480)).toBe("08h 00m"); // 8 hours
      expect(formatMinutes(525)).toBe("08h 45m"); // 8 hours 45 minutes
    });
  });

  describe("differenceInMinutes", () => {
    it("should calculate minutes between two dates", () => {
      const start = new Date("2024-01-01T10:00:00Z");
      const end = new Date("2024-01-01T10:30:00Z");
      expect(differenceInMinutes(start, end)).toBe(30);
    });

    it("should return 0 for same dates", () => {
      const date = new Date("2024-01-01T10:00:00Z");
      expect(differenceInMinutes(date, date)).toBe(0);
    });

    it("should return 0 when end is before start", () => {
      const start = new Date("2024-01-01T10:30:00Z");
      const end = new Date("2024-01-01T10:00:00Z");
      expect(differenceInMinutes(start, end)).toBe(0);
    });

    it("should calculate across hour boundaries", () => {
      const start = new Date("2024-01-01T10:30:00Z");
      const end = new Date("2024-01-01T12:00:00Z");
      expect(differenceInMinutes(start, end)).toBe(90);
    });

    it("should calculate across day boundaries", () => {
      const start = new Date("2024-01-01T23:00:00Z");
      const end = new Date("2024-01-02T01:00:00Z");
      expect(differenceInMinutes(start, end)).toBe(120);
    });
  });

  describe("getWeekDates", () => {
    it("should return 7 dates for a week", () => {
      const referenceDate = new Date(Date.UTC(2024, 0, 15)); // Monday, January 15, 2024
      const weekDates = getWeekDates(referenceDate);

      expect(weekDates).toHaveLength(7);
    });

    it("should return dates in order", () => {
      const referenceDate = new Date(Date.UTC(2024, 0, 15));
      const weekDates = getWeekDates(referenceDate);

      for (let i = 1; i < 7; i++) {
        expect(weekDates[i].getTime()).toBeGreaterThan(
          weekDates[i - 1].getTime(),
        );
      }
    });

    it("should include consecutive days", () => {
      const referenceDate = new Date(Date.UTC(2024, 0, 15));
      const weekDates = getWeekDates(referenceDate);

      for (let i = 1; i < 7; i++) {
        const dayDifference =
          (weekDates[i].getTime() - weekDates[i - 1].getTime()) /
          (1000 * 60 * 60 * 24);
        expect(dayDifference).toBe(1);
      }
    });

    it("should start on Monday", () => {
      const referenceDate = new Date(Date.UTC(2024, 0, 15)); // Monday
      const weekDates = getWeekDates(referenceDate);
      const firstDay = weekDates[0];

      expect(firstDay.getUTCDay()).toBe(1); // Monday
    });

    it("should work with different reference dates", () => {
      // Wednesday in the same week
      const wednesday = new Date(Date.UTC(2024, 0, 17));
      const weekDates = getWeekDates(wednesday);

      expect(weekDates[0].getUTCDay()).toBe(1); // Monday
      expect(weekDates[0].getUTCDate()).toBe(15);
    });
  });
});
