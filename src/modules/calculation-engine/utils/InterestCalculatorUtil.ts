export const calculateInterest = (
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
