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
