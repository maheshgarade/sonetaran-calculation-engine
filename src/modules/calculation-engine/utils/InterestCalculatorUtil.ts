export interface MonthlyBreakdown {
  month: number; // 1-indexed
  interest: number;
}

// What you hand to the user — the final maturity value
export const calculateTotalAmount = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
  interestType: string,
  compoundFrequency: string,
) => {
  if (interestType.toUpperCase() === "COMPOUND") {
    if (compoundFrequency.toUpperCase() === "ANNUALLY") {
      return calculateAnnualCompoundInterest(
        principal,
        annualRate,
        totalMonths,
        totalDays,
      );
    }
  } else if (interestType.toUpperCase() === "SIMPLE") {
    return calculateSimpleInterest(
      principal,
      annualRate,
      totalMonths,
      totalDays,
    );
  }
};

export const calculateAnnualCompoundInterest = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
) => {
  const years = Math.floor(totalMonths / 12); // Extract full years
  const months = totalMonths % 12; // Extract remaining months
  const rate = annualRate / 100;

  let amount = principal;

  // Calculate compound interest for each full year
  for (let i = 0; i < years; i++) {
    const interest = amount * rate; // Interest for the year
    amount += interest; // Add interest to the principal
  }

  // Calculate simple interest for the remaining months
  if (months > 0) {
    const monthlyRate = rate / 12; // Monthly rate
    const interestForMonths = amount * monthlyRate * months; // Simple interest for remaining months
    amount += interestForMonths; // Add interest for the remaining months
  }

  // Calculate simple interest for the remaining days
  if (totalDays > 0) {
    const dailyRate = rate / 365; // Daily rate
    const interestForDays = amount * dailyRate * totalDays; // Simple interest for remaining days
    amount += interestForDays; // Add interest for the remaining days
  }

  return Math.round(amount);
};

export const calculateSimpleInterest = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
) => {
  const years = Math.floor(totalMonths / 12); // Extract full years
  const months = totalMonths % 12; // Extract remaining months
  const rate = annualRate / 100;

  const amount = principal;
  let totalInterest = 0;

  // Calculate compound interest for each full year
  for (let i = 0; i < years; i++) {
    const interest = amount * rate; // Interest for the year
    totalInterest += interest;
  }

  // Calculate simple interest for the remaining months
  if (months > 0) {
    const monthlyRate = rate / 12; // Monthly rate
    const interestForMonths = amount * monthlyRate * months; // Simple interest for remaining months
    totalInterest += interestForMonths;
  }

  // Calculate simple interest for the remaining days
  if (totalDays > 0) {
    const dailyRate = rate / 365; // Daily rate
    const interestForDays = amount * dailyRate * totalDays; // Simple interest for remaining days
    totalInterest += interestForDays;
  }

  return Math.round(amount + totalInterest);
};

// Interest only, no principal
export const calculateTotalInterest = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
  interestType: string,
  compoundFrequency: string,
): number => {
  const breakdown = calculateMonthlyInterest(
    principal,
    annualRate,
    totalMonths,
    totalDays,
    interestType,
    compoundFrequency,
  );
  return breakdown.reduce((sum, entry) => sum + entry.interest, 0);
};

// Routing + per-month interest breakdown
export const calculateMonthlyInterest = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
  interestType: string,
  compoundFrequency: string,
): MonthlyBreakdown[] => {
  if (interestType.toUpperCase() === "SIMPLE") {
    return calculateSimpleInterestMonthly(
      principal,
      annualRate,
      totalMonths,
      totalDays,
    );
  }

  if (interestType.toUpperCase() === "COMPOUND") {
    if (compoundFrequency.toUpperCase() === "ANNUALLY") {
      return calculateAnnualCompoundInterestMonthly(
        principal,
        annualRate,
        totalMonths,
        totalDays,
      );
    }
    // Future: "MONTHLY", "QUARTERLY", etc.
  }

  return [];
};

export const calculateSimpleInterestMonthly = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
): MonthlyBreakdown[] => {
  const rate = annualRate / 100;
  const monthlyInterest = principal * (rate / 12); // Constant every month
  const result: MonthlyBreakdown[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    result.push({ month: m, interest: Math.round(monthlyInterest) });
  }

  // Fold remaining days into the last month (or create month 1 if no full months)
  if (totalDays > 0) {
    const daysInterest = principal * (rate / 365) * totalDays;
    if (result.length > 0) {
      result[result.length - 1].interest += Math.round(daysInterest);
    } else {
      result.push({ month: 1, interest: Math.round(daysInterest) });
    }
  }

  return result;
};

export const calculateAnnualCompoundInterestMonthly = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
): MonthlyBreakdown[] => {
  const rate = annualRate / 100;
  const fullYears = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  const result: MonthlyBreakdown[] = [];

  let currentPrincipal = principal;
  let monthCounter = 1;

  // Full years: within each year, monthly interest is uniform (same base),
  // then the principal compounds at year-end before the next year starts
  for (let y = 0; y < fullYears; y++) {
    const monthlyInterest = currentPrincipal * (rate / 12);
    for (let m = 0; m < 12; m++) {
      result.push({
        month: monthCounter++,
        interest: Math.round(monthlyInterest),
      });
    }
    currentPrincipal *= 1 + rate; // Compound at year boundary
  }

  // Remaining months: simple interest on the now-compounded principal
  if (remainingMonths > 0) {
    const monthlyInterest = currentPrincipal * (rate / 12);
    for (let m = 0; m < remainingMonths; m++) {
      result.push({
        month: monthCounter++,
        interest: Math.round(monthlyInterest),
      });
    }
    currentPrincipal += currentPrincipal * (rate / 12) * remainingMonths;
  }

  // Fold remaining days into the last month
  if (totalDays > 0) {
    const daysInterest = currentPrincipal * (rate / 365) * totalDays;
    if (result.length > 0) {
      result[result.length - 1].interest += Math.round(daysInterest);
    } else {
      result.push({ month: 1, interest: Math.round(daysInterest) });
    }
  }

  return result;
};

export const interestBreakdown = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
  interestType: string,
  compoundFrequency: string,
) => {
  if (interestType.toUpperCase() === "COMPOUND") {
    if (compoundFrequency.toUpperCase() === "ANNUALLY") {
      return annualCompoundInterestBreakdown(
        principal,
        annualRate,
        totalMonths,
        totalDays,
      );
    }
  } else if (interestType.toUpperCase() === "SIMPLE") {
    return simpleInterestBreakdown(
      principal,
      annualRate,
      totalMonths,
      totalDays,
    );
  }
};

export const annualCompoundInterestBreakdown = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
) => {
  const years = Math.floor(totalMonths / 12); // Extract full years
  const months = totalMonths % 12; // Extract remaining months
  const rate = annualRate / 100;
  const monthlyInterest = annualRate / 12; // Monthly ROI

  let amount = principal;
  const breakdown = [];

  // Calculate compound interest for each full year
  for (let i = 1; i <= years; i++) {
    const interest = amount * rate; // Interest for the year
    const total = amount + interest; // New principal for next year

    breakdown.push({
      duration: i,
      unit: "year",
      principal: Math.round(amount),
      interest: Math.round(interest),
      total: Math.round(total),
      roi: monthlyInterest,
      rate: rate,
    });

    amount = total; // Update principal for next year
  }

  // Calculate simple interest for the remaining months
  if (months > 0) {
    const monthlyRate = rate / 12; // Monthly rate
    const interestForMonths = amount * monthlyRate * months; // Simple interest for remaining months
    const total = amount + interestForMonths;

    breakdown.push({
      duration: months,
      unit: "month",
      principal: Math.round(amount),
      interest: Math.round(interestForMonths),
      total: Math.round(total),
      roi: monthlyInterest,
      rate: rate,
    });

    amount = total; // Update principal for remaining days
  }

  // Calculate simple interest for the remaining days
  if (totalDays > 0) {
    const dailyRate = rate / 365; // Daily rate
    const interestForDays = amount * dailyRate * totalDays; // Simple interest for remaining days
    const total = amount + interestForDays;

    breakdown.push({
      duration: totalDays,
      unit: "days",
      principal: Math.round(amount),
      interest: Math.round(interestForDays),
      total: Math.round(total),
      roi: totalDays >= 15 ? Number(monthlyInterest) / 2 : monthlyInterest,
      rate: rate,
    });

    amount = total; // Final amount
  }

  return breakdown;
};

export const simpleInterestBreakdown = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  totalDays: number,
) => {
  const years = Math.floor(totalMonths / 12); // Extract full years
  const months = totalMonths % 12; // Extract remaining months
  const rate = annualRate / 100;
  const monthlyInterest = annualRate / 12; // Monthly ROI

  let totalInterest = 0;
  const breakdown = [];

  // Calculate compound interest for each full year
  for (let i = 1; i <= years; i++) {
    const interest = principal * rate; // Interest for the year
    const total = totalInterest + interest; // New principal for next year

    breakdown.push({
      duration: i,
      unit: "year",
      principal: Math.round(principal),
      principleAndInterest: Math.round(principal + totalInterest),
      interest: Math.round(interest),
      total: Math.round(principal + total),
      roi: monthlyInterest,
      rate: rate,
    });

    totalInterest = total; // Update principal for next year
  }

  // Calculate simple interest for the remaining months
  if (months > 0) {
    const monthlyRate = rate / 12; // Monthly rate
    const interestForMonths = principal * monthlyRate * months; // Simple interest for remaining months
    const total = totalInterest + interestForMonths;

    breakdown.push({
      duration: months,
      unit: "month",
      principal: Math.round(principal),
      principleAndInterest: Math.round(principal + totalInterest),
      interest: Math.round(interestForMonths),
      total: Math.round(principal + total),
      roi: monthlyInterest,
      rate: rate,
    });

    totalInterest = total; // Update principal for remaining days
  }

  // Calculate simple interest for the remaining days
  if (totalDays > 0) {
    const dailyRate = rate / 365; // Daily rate
    const interestForDays = principal * dailyRate * totalDays; // Simple interest for remaining days
    const total = totalInterest + interestForDays;

    breakdown.push({
      duration: totalDays,
      unit: "days",
      principal: Math.round(principal),
      principleAndInterest: Math.round(principal + totalInterest),
      interest: Math.round(interestForDays),
      total: Math.round(principal + total),
      roi: totalDays >= 15 ? Number(monthlyInterest) / 2 : monthlyInterest,
      rate: rate,
    });

    totalInterest = total; // Final amount
  }

  return breakdown;
};
