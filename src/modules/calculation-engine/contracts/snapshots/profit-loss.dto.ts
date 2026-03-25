import { FunderType } from "@/modules/calculation-engine/enums/funder-type.enum";
import { DurationResult } from "@/modules/calculation-engine/core/duration/duration.types";
import { InterestBreakdown } from "@/modules/calculation-engine/core/interest/interest.types";

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
  fundingDue: Partial<Record<FunderType, FundingEntityDTO>>;

  totalFundingDue: number;

  monthlyProfit: number;
  totalProfit: number;
}
