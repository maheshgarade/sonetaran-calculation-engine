import { FundingSlice } from "@/modules/funding/funding.types";

export function calculateOverBorrowedPrincipal(
  fundingSlices: FundingSlice[],
  customerPrincipal: number,
): number {
  const activeSlices = fundingSlices.filter((s) => !s.endDate);

  const totalFunding = activeSlices.reduce(
    (sum, slice) => sum + (slice.fundingPrincipal || 0),
    0,
  );

  return Math.max(totalFunding - customerPrincipal, 0);
}
