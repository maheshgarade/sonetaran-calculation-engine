export const formatCurrency = (amount: number | null) => {
  if (!amount) {
    return;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
