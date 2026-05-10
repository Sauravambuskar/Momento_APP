import { differenceInWeeks, addWeeks, format, startOfWeek } from "date-fns";

export interface LifeStats {
  totalWeeks: number;
  weeksLived: number;
  weeksRemaining: number;
  percentLived: number;
  currentWeekNumber: number;
}

export function getLifeStats(birthDate: Date, lifespan: number): LifeStats {
  const totalWeeks = lifespan * 52;
  const weeksLived = Math.max(0, differenceInWeeks(new Date(), birthDate));
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentLived = Math.min(100, (weeksLived / totalWeeks) * 100);
  const currentWeekNumber = weeksLived + 1;

  return {
    totalWeeks,
    weeksLived,
    weeksRemaining,
    percentLived,
    currentWeekNumber,
  };
}

export function getWeekDateRange(
  birthDate: Date,
  weekIndex: number
): { start: string; end: string } {
  const start = addWeeks(birthDate, weekIndex);
  const end = addWeeks(start, 1);
  return {
    start: format(start, "MMM d, yyyy"),
    end: format(end, "MMM d, yyyy"),
  };
}

export function getWeekKey(weekNumber: number): string {
  return `week_${weekNumber}`;
}

export function getWeekYearFromNumber(
  weekNumber: number
): { year: number; weekInYear: number } {
  const year = Math.floor((weekNumber - 1) / 52);
  const weekInYear = ((weekNumber - 1) % 52) + 1;
  return { year, weekInYear };
}

export function formatAge(birthDate: Date, weekNumber: number): string {
  const { year } = getWeekYearFromNumber(weekNumber);
  return `Age ${year}`;
}
