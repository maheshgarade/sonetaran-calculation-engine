import { calculateAnnualCompoundInterest } from "../core/interest/interest.calculator";

//This method depend on calculateAnnualCompoundInterest to calculate max loan tenure
export const calculateMaxLoanTenure = (
  loanAmount: number,
  itemValue: number,
  annualRate: number,
): number => {
  let months = 0;
  let amount = loanAmount;

  while (amount < itemValue) {
    months++;
    amount = calculateAnnualCompoundInterest(loanAmount, annualRate, months, 0);

    // Ensure we don't exceed the item value
    if (amount > itemValue) {
      months--; // Step back to the previous valid month
      break;
    }
  }

  const totalYears = months / 12;
  console.log("totalYears ", totalYears);
  const totalMonths = months;

  return totalMonths;
};

// Example usage
// const maxTenure = calculateMaxLoanTenure(95630, 159384, 36);
// console.log(`Maximum loan tenure in years: ${maxTenure.formattedYears}`);
// console.log(`Maximum loan tenure in months: ${maxTenure.formattedMonths}`);

//Standalone method to calculate max loan tenure
export const calculateMaxLoanTenure2 = (
  loanAmount: number,
  itemValue: number,
  annualRate: number,
): number => {
  // console.log('loanAmount ', loanAmount);
  // console.log('itemValue ', itemValue);
  // console.log('annualRate ', annualRate);
  const rate = annualRate / 100;

  let months = 0;
  let currentAmount = loanAmount;

  while (currentAmount <= itemValue) {
    months++;

    // Calculate the number of complete years and remaining months
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    // Start with original principal
    currentAmount = loanAmount;

    // Apply compound interest for complete years
    for (let i = 0; i < years; i++) {
      currentAmount += currentAmount * rate;
    }

    // Apply simple interest for remaining months
    if (remainingMonths > 0) {
      const monthlyRate = rate / 12;
      const interestForMonths = currentAmount * monthlyRate * remainingMonths;
      currentAmount += interestForMonths;
    }

    // Round to nearest integer as per the reference function
    currentAmount = Math.round(currentAmount);

    // Safety check to prevent infinite loop
    if (months > 360) {
      // 30 years
      return 360;
    }
  }

  return months - 1; // Return the last month where amount was under item value
};

// Test the final result
// const maxTenure = calculateMaxLoanTenure(95630, 159384, 24);
// console.log(`\nMaximum loan tenure: ${maxTenure} months`);
