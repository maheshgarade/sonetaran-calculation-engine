export interface DurationResult {
  totalMonths: number;
  days: number;
}

export const calculateMonthsAndDays = (
  startDate: Date | null,
  endDate?: Date | null,
): DurationResult => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Calculate the number of full months
  let monthsDifference =
    end.getMonth() -
    start.getMonth() +
    12 * (end.getFullYear() - start.getFullYear());

  // Calculate the remaining days, including the end date
  let daysDifference;
  if (end.getDate() >= start.getDate()) {
    // If the end day is greater than or equal to the start day, simply subtract and add 1 (to include the end date)
    daysDifference = end.getDate() - start.getDate() + 1;
  } else {
    // If the end day is less than the start day, adjust the months and calculate days
    monthsDifference--;
    // Get the last day of the previous month
    const tempDate = new Date(end.getFullYear(), end.getMonth(), 0);
    daysDifference = end.getDate() + (tempDate.getDate() - start.getDate()) + 1;
  }

  return {
    totalMonths: monthsDifference,
    days: daysDifference,
  };
};

const roundMonthsAndDays = (
  months: number,
  days: number,
  mode: string = "MONTHLY",
  count: number = 0,
): DurationResult => {
  // Apply Grace period first
  const effectiveDays = Math.max(0, days - count);

  if (mode === "MONTHLY") {
    // If any days remain after waiving, treat them as a full month
    if (months === 0 && effectiveDays > 0) {
      return { totalMonths: 1, days: 0 };
    } else if (months > 0) {
      if (effectiveDays > 0) {
        return { totalMonths: months + 1, days: 0 };
      }
    }
    return { totalMonths: months, days: 0 };
  }

  if (mode === "MONTHLY_15") {
    if (months === 0 && effectiveDays > 0) {
      return { totalMonths: 1, days: 0 };
    } else if (months > 0) {
      if (effectiveDays >= 1 && effectiveDays <= 15) {
        return { totalMonths: months, days: 15 };
      } else if (effectiveDays > 15) {
        return { totalMonths: months + 1, days: 0 };
      }
    }
    return { totalMonths: months, days: effectiveDays };
  }

  // default "daily" or other modes
  return { totalMonths: months, days: effectiveDays };
};

export const calculateRoundedMonthsAndDays = (
  startDate: Date | null,
  endDate: Date | null,
  mode: string = "MONTHLY",
  count: number = 0,
): DurationResult => {
  const rawResult = calculateMonthsAndDays(startDate, endDate);
  return roundMonthsAndDays(rawResult.totalMonths, rawResult.days, mode, count);
};

export const convertToYearsMonthsDays = (totalMonths: number, days: number) => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months, days };
};

export const getDurationString = (startDate: Date, endDate: Date): string => {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years}Y`);
  if (months > 0) parts.push(`${months}M`);
  if (days > 0 || (years === 0 && months === 0 && days === 0))
    parts.push(`${days}D`);

  return parts.join(" ");
};
