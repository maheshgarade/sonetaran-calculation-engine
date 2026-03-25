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
