import { KalamType } from "@/modules/kalams/kalam.types";
import { FundingSlice } from "@/modules/funding/funding.types";

import {
  ProfitLossDTO,
  FundingEntityDTO,
} from "@/modules/calculation-engine/contracts/snapshots/profit-loss.dto";

import { FunderType } from "@/modules/calculation-engine/enums/funder-type.enum";

import { CalculationEngine } from "@/modules/calculation-engine/orchestrators/calculation.engine";
import { InterestBreakdown } from "@/modules/calculation-engine/core/interest/interest.types";
import { normalizeFunderType } from "../helpers/funder-type.helper";

export class ProfitLossSnapshot {
  static compute(kalam: KalamType, slices: FundingSlice[]): ProfitLossDTO {
    const now = new Date();

    // 1. CUSTOMER
    const customer = this.computeCustomer(kalam, now);

    // 2. FUNDING (Vyapari / Dukandar)
    const fundingMap = this.computeFunding(slices, now);

    // 3. PROFIT
    const profit = this.computeProfit(customer, fundingMap);

    // 4. TOTAL FUNDING DUE
    const totalFundingDue =
      (fundingMap[FunderType.VYAPARI]?.total || 0) +
      (fundingMap[FunderType.DUKANDAR]?.total || 0);

    return {
      fundingDue: {
        customer,
        ...fundingMap,
      },
      totalFundingDue,
      monthlyProfit: profit.monthly,
      totalProfit: profit.total,
    };
  }

  // =========================
  // CUSTOMER
  // =========================
  private static computeCustomer(
    kalam: KalamType,
    now: Date,
  ): FundingEntityDTO {
    const annualRate = (kalam.interest?.rate || 0) * 12;

    const duration = CalculationEngine.calculateRoundedMonthsAndDays(
      CalculationEngine.toDate(kalam.startDate),
      now,
      kalam.durationType,
      kalam.gracePeriod,
    );

    const total =
      CalculationEngine.calculateTotalAmount(
        kalam.customerPrincipal,
        annualRate,
        duration.totalMonths,
        duration.days,
        kalam.interest?.type || "SIMPLE",
        kalam.interest?.compoundFrequency || "ANNUALLY",
      ) || 0;

    const breakdown: InterestBreakdown[] =
      CalculationEngine.interestBreakdown(
        kalam.customerPrincipal,
        annualRate,
        duration.totalMonths,
        duration.days,
        kalam.interest?.type || "SIMPLE",
        kalam.interest?.compoundFrequency || "ANNUALLY",
      ) || [];

    const monthlyList = CalculationEngine.calculateMonthlyInterest(
      kalam.customerPrincipal,
      annualRate,
      duration.totalMonths,
      duration.days,
      kalam.interest?.type || "SIMPLE",
      kalam.interest?.compoundFrequency || "ANNUALLY",
    );

    const totalInterest = breakdown.reduce(
      (acc, curr) => acc + curr.interest,
      0,
    );
    const monthlyInterest = monthlyList[monthlyList.length - 1]?.interest || 0;

    return {
      principal: kalam.customerPrincipal,
      total,
      duration,
      breakdown,
      interest: {
        total: totalInterest,
        monthly: monthlyInterest,
      },
    };
  }

  // =========================
  // FUNDING
  // =========================
  private static computeFunding(
    slices: FundingSlice[],
    now: Date,
  ): Partial<Record<FunderType, FundingEntityDTO>> {
    const result: Partial<Record<FunderType, FundingEntityDTO>> = {};

    for (const slice of slices) {
      const funderType = normalizeFunderType(slice.funderType);

      const entity = this.computeSingleFunding(slice, now);

      result[funderType] = entity;
    }

    return result;
  }

  private static computeSingleFunding(
    slice: FundingSlice,
    now: Date,
  ): FundingEntityDTO {
    const annualRate = (slice.interest?.rate || 0) * 12;

    const duration = CalculationEngine.calculateRoundedMonthsAndDays(
      CalculationEngine.toDate(slice.startDate),
      now,
      slice.terms?.duration,
      slice.terms?.graceDays || 0,
    );

    const total =
      CalculationEngine.calculateTotalAmount(
        slice.fundingPrincipal,
        annualRate,
        duration.totalMonths,
        duration.days,
        slice.interest?.type || "SIMPLE",
        slice.interest?.compoundFrequency || "ANNUALLY",
      ) || 0;

    const breakdown: InterestBreakdown[] =
      CalculationEngine.interestBreakdown(
        slice.fundingPrincipal,
        annualRate,
        duration.totalMonths,
        duration.days,
        slice.interest?.type || "SIMPLE",
        slice.interest?.compoundFrequency || "ANNUALLY",
      ) || [];

    const monthlyList = CalculationEngine.calculateMonthlyInterest(
      slice.fundingPrincipal,
      annualRate,
      duration.totalMonths,
      duration.days,
      slice.interest?.type || "SIMPLE",
      slice.interest?.compoundFrequency || "ANNUALLY",
    );

    const totalInterest = breakdown.reduce(
      (acc, curr) => acc + curr.interest,
      0,
    );
    const monthlyInterest = monthlyList[monthlyList.length - 1]?.interest || 0;

    return {
      principal: slice.fundingPrincipal,
      total,
      duration,
      breakdown,
      interest: {
        total: totalInterest,
        monthly: monthlyInterest,
      },
    };
  }

  // =========================
  // PROFIT
  // =========================
  private static computeProfit(
    customer: FundingEntityDTO,
    funding: Partial<Record<FunderType, FundingEntityDTO>>,
  ) {
    const vyapari = funding[FunderType.VYAPARI];
    const dukandar = funding[FunderType.DUKANDAR];
    // const customer = funding[FunderType.DUKANDAR];

    const monthly =
      customer.interest.monthly -
      ((vyapari?.interest.monthly || 0) + (dukandar?.interest.monthly || 0));

    const total =
      customer.interest.total -
      ((vyapari?.interest.total || 0) + (dukandar?.interest.total || 0));

    return { monthly, total };
  }
}
