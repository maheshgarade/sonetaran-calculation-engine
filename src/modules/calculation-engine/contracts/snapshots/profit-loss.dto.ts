import { DurationResult } from "@/modules/calculation-engine/core/duration/duration.types";
import { InterestBreakdown } from "@/modules/calculation-engine/core/interest/interest.types";

export interface FundingDueDTO {
  customer?: FundingEntityDTO;
  vyapari?: FundingEntityDTO;
  dukandar?: FundingEntityDTO;
  overBorrowed?: FundingEntityDTO;
}

export interface FundingEntityDTO {
  principal: number;
  total: number;

  duration: DurationResult;

  interest: {
    monthly: number;
    total: number;
  };

  breakdown: InterestBreakdown[];
}

export interface ProfitLossDTO {
  fundingDue: FundingDueDTO;

  totalFundingDue: number;

  monthlyProfit: number;
  totalProfit: number;
}
