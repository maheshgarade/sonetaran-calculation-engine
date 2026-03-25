/**
 * CalculationEngine
 *
 * Centralized business logic for SoneTaran.
 * Handles financial calculations, risk assessment, and value estimations.
 */

import {
  calculateRoundedMonthsAndDays,
  getDurationString,
  type DurationResult,
} from "../core/duration/duration.calculator";
import {
  calculateMonthlyInterest,
  calculateTotalAmount,
  interestBreakdown,
} from "../core/interest/interest.calculator";
import { calculateMaxLoanTenure2 } from "../rules/tenure.rules";
import { FunderType } from "../enums/funder-type.enum";
import type { DurationMode } from "../enums/duration-mode.enum";
import type { InterestBreakdown } from "../core/interest/interest.types";
import type { FundingSlice, FundingData } from "../../funding/funding.types";
import type {
  SliceStatus,
  PartnerMetrics,
  KalamType,
} from "../../kalams/kalam.types";

export class CalculationEngine {
  /**
   * Calculates the estimated monthly interest for a loan.
   * Currently assumes Simple Interest with a monthly rate.
   *
   * @param principal Principal amount (e.g., customerPrincipal)
   * @param rate Interest rate per month (percentage, e.g., 2 for 2%)
   * @returns Monthly interest amount
   */
  static calculateMonthlySimpleInterest(
    principal: number,
    rate: number,
  ): number {
    if (!principal || !rate) return 0;
    return (principal * rate) / 100;
  }

  /**
   * Staggered Compound Interest Calculator (Yearly Capitalization)
   *
   * @param principal Principal amount
   * @param monthlyRate Monthly interest rate (percentage, e.g., 3 for 3%)
   * @param months Number of months (loan duration)
   * @returns Compound interest accrued
   */
  static calculateCompoundInterest(
    principal: number,
    monthlyRate: number,
    months: number,
  ): number {
    if (!principal || !monthlyRate || !months) return 0;

    let currentPrincipal = principal;
    let totalInterest = 0;

    // In local markets, interest compounds every 12 months exactly.
    const fullYears = Math.floor(months / 12);
    const remainingMonths = months % 12;

    for (let i = 0; i < fullYears; i++) {
      const yearInterest = currentPrincipal * (monthlyRate / 100) * 12;
      totalInterest += yearInterest;
      currentPrincipal += yearInterest; // Capitalize
    }

    const remainingInterest =
      currentPrincipal * (monthlyRate / 100) * remainingMonths;
    totalInterest += remainingInterest;

    return Math.round(totalInterest);
  }

  /**
   * Calculates the total value of a gold item.
   *
   * @param weight Net weight of the gold item
   * @param purity Purity percentage (e.g., 91.6 for 22K)
   * @param rate Current market rate per unit of weight (valuation rate)
   * @returns Total value of the gold item
   */
  static calculateGoldValue(
    weight: number,
    purity: number,
    rate: number,
  ): number {
    if (!weight || !purity || !rate) return 0;
    return weight * (purity / 100) * rate;
  }

  /**
   * Calculates the Loan-to-Value (LTV) ratio.
   *
   * @param principal Loan principal amount
   * @param collateralValue Total value of the collateral
   * @returns LTV percentage (e.g., 75.5)
   */
  static calculateLTV(principal: number, collateralValue: number): number {
    if (!collateralValue || collateralValue === 0) return 0;
    return (principal / collateralValue) * 100;
  }

  /**
   * Assesses if a loan is high risk based on LTV.
   *
   * @param ltv Loan-to-Value ratio
   * @param threshold Threshold for high risk (default 75%)
   * @returns True if high risk
   */
  static isHighRisk(ltv: number, threshold: number = 75): boolean {
    return ltv > threshold;
  }

  /**
   * Calculates aggregated stats for a collection of data.
   * Example: Safely summing up values.
   */
  static sum(values: number[]): number {
    return values.reduce((acc, curr) => acc + (curr || 0), 0);
  }
  /**
   * Calculates the total outstanding customer principal.
   */
  static calculateTotalOutstanding(principals: number[]): number {
    return this.sum(principals);
  }

  /**
   * Calculates the total debt (e.g., from Vyaparis).
   */
  static calculateTotalDebt(fundings: number[]): number {
    return this.sum(fundings);
  }

  /**
   * Calculates self-investment amount.
   * Logic: Total Outstanding - Total Debt.
   * If Debt > Outstanding, Self investment is 0 (or negative, but practically 0 implies all funded by debt).
   * However, usually self investment = whatever is NOT covered by debt.
   */
  static calculateSelfInvestment(
    totalOutstanding: number,
    totalDebt: number,
  ): number {
    const self = totalOutstanding - totalDebt;
    return self > 0 ? self : 0;
  }

  /**
   * Calculates idle cash / over-borrowed amount.
   * Logic: If Debt > Outstanding, the difference is idle cash.
   */
  static calculateIdleCash(
    totalOutstanding: number,
    totalDebt: number,
  ): number {
    return totalDebt > totalOutstanding ? totalDebt - totalOutstanding : 0;
  }

  // Below are implemented manually and not by AI. The above are AI implemented and are used in reports.controller.ts so need to test them later
  static getDurationString(startDate: Date, endDate: Date): string {
    return getDurationString(startDate, endDate);
  }

  static calculateValidTillDate(
    loanAmt: number,
    totalValue: number,
    monthlyROI: number,
  ): Date {
    const annualROI = monthlyROI * 12;
    const months = calculateMaxLoanTenure2(loanAmt, totalValue, annualROI);
    const today = new Date();
    const validTill = new Date(today);
    validTill.setMonth(validTill.getMonth() + months);
    return validTill;
  }

  static calculateRoundedMonthsAndDays(
    startDate: Date | null,
    endDate: Date | null,
    mode: DurationMode,
    count: number = 0,
  ): DurationResult {
    return calculateRoundedMonthsAndDays(startDate, endDate, mode, count);
  }

  /**
   * Determines if a slice is active or closed based on dates.
   * @param startDate ISO string or null/undefined
   * @param endDate ISO string or null/undefined
   * @returns SliceStatus
   * @throws Error with specific details on validation failure
   */
  static getSliceStatus(
    startDate?: string | Date | null,
    endDate?: string | Date | null,
  ): SliceStatus {
    // 1. Check if startDate is missing entirely
    if (!startDate) {
      throw new Error(
        "Validation Error: 'startDate' is required but was not provided.",
      );
    }

    const start = new Date(startDate);

    // Check for Invalid Date (e.g., "abc" or empty string)
    if (isNaN(start.getTime())) {
      throw new Error(
        `Validation Error: Provided 'startDate' ("${startDate}") is not a valid date.`,
      );
    }

    // 2. Scenario: No endDate provided (Active)
    if (!endDate) {
      return "active";
    }

    const end = new Date(endDate);

    // Check for Invalid Date
    if (isNaN(end.getTime())) {
      throw new Error(
        `Validation Error: Provided 'endDate' ("${endDate}") is not a valid date.`,
      );
    }

    // 3. Scenario: endDate is provided (Closed) - Validate sequence
    const startTime = start.getTime();
    const endTime = end.getTime();

    if (startTime === endTime) {
      throw new Error(
        "Validation Error: 'startDate' and 'endDate' cannot be the exact same time.",
      );
    }

    if (endTime < startTime) {
      throw new Error(
        "Validation Error: 'endDate' must be later than 'startDate'.",
      );
    }

    return "closed";
  }

  static toDate(value: string | Date | null): Date | null {
    if (!value) return null;
    return typeof value === "string" ? new Date(value) : value;
  }

  static getDuration(fundingSlices: FundingSlice[]): PartnerMetrics {
    const now = new Date();
    const duration: PartnerMetrics = {
      VYAPARI: { totalMonths: 0, days: 0 },
      DUKANDAR: { totalMonths: 0, days: 0 },
    };
    fundingSlices.forEach((slice) => {
      if (
        CalculationEngine.getSliceStatus(slice.startDate, slice.endDate) ===
        "active"
      ) {
        let sliceDuration: { totalMonths: number; days: number };
        if (slice.funderType?.toLocaleUpperCase() === FunderType.VYAPARI) {
          sliceDuration = CalculationEngine.calculateRoundedMonthsAndDays(
            CalculationEngine.toDate(slice.startDate),
            now,
            slice.terms?.duration?.toUpperCase() as DurationMode,
            slice.terms?.graceDays || 0,
          );
          duration[FunderType.VYAPARI] = sliceDuration;
        } else if (
          slice.funderType?.toLocaleUpperCase() === FunderType.DUKANDAR
        ) {
          sliceDuration = CalculationEngine.calculateRoundedMonthsAndDays(
            CalculationEngine.toDate(slice.startDate),
            now,
            slice.terms?.duration?.toUpperCase() as DurationMode,
            slice.terms?.graceDays || 0,
          );
          duration[FunderType.DUKANDAR] = sliceDuration;
        } else {
          return {
            VYAPARI: { totalMonths: 0, days: 0 },
            DUKANDAR: { totalMonths: 0, days: 0 },
          };
        }
        // if (slice.kalamId.toString() === "69bfc40dd25f125628a8d102") {
        //   // console.log("****************active slice found", slice.funderType);
        //   console.log("****************active slice", slice);
        //   console.log("****************duration", duration);
        // }
      }
    });
    return duration;
  }

  static interestBreakdown(
    principal: number,
    annualRate: number,
    totalMonths: number,
    totalDays: number,
    interestType: string,
    compoundFrequency: string,
  ) {
    return interestBreakdown(
      principal,
      annualRate,
      totalMonths,
      totalDays,
      interestType,
      compoundFrequency,
    );
  }

  static calculateTotalAmount(
    principal: number,
    annualRate: number,
    totalMonths: number,
    totalDays: number,
    interestType: string,
    compoundFrequency: string,
  ) {
    return calculateTotalAmount(
      principal,
      annualRate,
      totalMonths,
      totalDays,
      interestType,
      compoundFrequency,
    );
  }

  static calculateMonthlyInterest(
    principal: number,
    annualRate: number,
    totalMonths: number,
    totalDays: number,
    interestType: string,
    compoundFrequency: string,
  ) {
    return calculateMonthlyInterest(
      principal,
      annualRate,
      totalMonths,
      totalDays,
      interestType,
      compoundFrequency,
    );
  }

  static calculateProfitLossSnapshot(
    fundingSlices: FundingSlice[],
    kalam: KalamType,
  ): FundingData {
    const now = new Date();
    const customerAnnualInterestRate = (kalam.interest?.rate || 0) * 12 || 0;
    const profitLossSnapshot: FundingData = {
      fundingDue: {
        customer: undefined,
        vyapari: undefined,
        dukandar: undefined,
        overBorrowed: undefined,
      },
      totalFundingDue: 0,
      monthlyProfit: 0,
      totalProfit: 0,
    };

    const roundedLoanDuration: { totalMonths: number; days: number } =
      CalculationEngine.calculateRoundedMonthsAndDays(
        CalculationEngine.toDate(kalam.startDate),
        now,
        kalam.durationType.toUpperCase() as DurationMode,
        kalam.gracePeriod,
      );

    const total =
      CalculationEngine.calculateTotalAmount(
        kalam.customerPrincipal,
        customerAnnualInterestRate,
        roundedLoanDuration.totalMonths,
        roundedLoanDuration.days,
        kalam.interest?.type || "SIMPLE",
        kalam.interest?.compoundFrequency || "ANNUALLY",
      ) || 0;

    const breakdown: InterestBreakdown[] =
      CalculationEngine.interestBreakdown(
        kalam.customerPrincipal,
        customerAnnualInterestRate,
        roundedLoanDuration.totalMonths,
        roundedLoanDuration.days,
        kalam.interest?.type || "SIMPLE",
        kalam.interest?.compoundFrequency || "ANNUALLY",
      ) || [];
    console.log("breakdown", breakdown);
    const totalInterest = breakdown.reduce(
      (acc: number, curr: InterestBreakdown) => acc + (curr.interest || 0),
      0,
    );

    const monthlyInterestList = CalculationEngine.calculateMonthlyInterest(
      kalam.customerPrincipal,
      customerAnnualInterestRate,
      roundedLoanDuration.totalMonths,
      roundedLoanDuration.days,
      kalam.interest?.type || "SIMPLE",
      kalam.interest?.compoundFrequency || "ANNUALLY",
    );

    const monthlyInterest =
      monthlyInterestList[monthlyInterestList?.length - 1]?.interest;
    const interest = { total: totalInterest, monthly: monthlyInterest };

    profitLossSnapshot.fundingDue.customer = {
      breakdown,
      interest,
      principal: kalam.customerPrincipal,
      total,
      roundedLoanDuration,
    };

    fundingSlices.forEach((slice) => {
      const { funderType } = slice;

      if (funderType?.toUpperCase() === "VYAPARI") {
        const vyapariAnnualInterestRate = slice.interest?.rate * 12 || 0;
        const roundedLoanDuration: { totalMonths: number; days: number } =
          CalculationEngine.calculateRoundedMonthsAndDays(
            CalculationEngine.toDate(slice.startDate),
            now,
            slice.terms?.duration?.toUpperCase() as DurationMode,
            slice.terms?.graceDays || 0,
          );

        const total =
          CalculationEngine.calculateTotalAmount(
            slice.fundingPrincipal,
            vyapariAnnualInterestRate,
            roundedLoanDuration.totalMonths,
            roundedLoanDuration.days,
            slice.interest?.type,
            slice.interest?.compoundFrequency || "ANNUALLY",
          ) || 0;

        const breakdown =
          CalculationEngine.interestBreakdown(
            slice.fundingPrincipal,
            vyapariAnnualInterestRate,
            roundedLoanDuration.totalMonths,
            roundedLoanDuration.days,
            slice.interest?.type,
            slice.interest?.compoundFrequency || "ANNUALLY",
          ) || [];

        const totalInterest = breakdown.reduce(
          (acc, curr) => acc + (curr.interest || 0),
          0,
        );

        const monthlyInterestList = CalculationEngine.calculateMonthlyInterest(
          slice.fundingPrincipal,
          vyapariAnnualInterestRate,
          15,
          roundedLoanDuration.days,
          slice.interest?.type,
          slice.interest?.compoundFrequency || "ANNUALLY",
        );
        const monthlyInterest =
          monthlyInterestList[monthlyInterestList?.length - 1]?.interest;
        const interest = { total: totalInterest, monthly: monthlyInterest };

        profitLossSnapshot.fundingDue.vyapari = {
          breakdown,
          interest,
          principal: slice.fundingPrincipal,
          total,
          roundedLoanDuration,
        };
      } else if (funderType?.toUpperCase() === "DUKANDAR") {
        const dukandarAnnualInterestRate = slice.interest?.rate * 12 || 0;

        const roundedLoanDuration: { totalMonths: number; days: number } =
          CalculationEngine.calculateRoundedMonthsAndDays(
            CalculationEngine.toDate(slice.startDate),
            now,
            slice.terms?.duration?.toUpperCase() as DurationMode,
            slice.terms?.graceDays || 0,
          );

        const total =
          CalculationEngine.calculateTotalAmount(
            slice.fundingPrincipal,
            dukandarAnnualInterestRate,
            roundedLoanDuration.totalMonths,
            roundedLoanDuration.days,
            slice.interest?.type,
            slice.interest?.compoundFrequency || "ANNUALLY",
          ) || 0;

        const breakdown =
          CalculationEngine.interestBreakdown(
            slice.fundingPrincipal,
            dukandarAnnualInterestRate,
            roundedLoanDuration.totalMonths,
            roundedLoanDuration.days,
            slice.interest?.type,
            slice.interest?.compoundFrequency || "ANNUALLY",
          ) || [];

        const totalInterest = breakdown.reduce(
          (acc, curr) => acc + (curr.interest || 0),
          0,
        );

        const monthlyInterestList = CalculationEngine.calculateMonthlyInterest(
          slice.fundingPrincipal,
          dukandarAnnualInterestRate,
          15,
          roundedLoanDuration.days,
          slice.interest?.type,
          slice.interest?.compoundFrequency || "ANNUALLY",
        );

        const monthlyInterest =
          monthlyInterestList[monthlyInterestList?.length - 1]?.interest;
        const interest = { total: totalInterest, monthly: monthlyInterest };

        profitLossSnapshot.fundingDue.dukandar = {
          breakdown,
          interest,
          principal: slice.fundingPrincipal,
          total,
          roundedLoanDuration,
        };
      }
    });
    profitLossSnapshot.monthlyProfit =
      profitLossSnapshot.fundingDue.customer.interest.monthly -
      ((profitLossSnapshot.fundingDue.vyapari?.interest.monthly || 0) +
        (profitLossSnapshot.fundingDue.overBorrowed?.interest.monthly || 0));

    profitLossSnapshot.totalProfit =
      profitLossSnapshot.fundingDue.customer.interest.total -
      ((profitLossSnapshot.fundingDue.vyapari?.interest.total || 0) +
        (profitLossSnapshot.fundingDue.overBorrowed?.interest.total || 0));

    profitLossSnapshot.totalFundingDue =
      (profitLossSnapshot.fundingDue.dukandar?.total || 0) +
      (profitLossSnapshot.fundingDue.overBorrowed?.total || 0);

    console.log("*****************profitLossSnapshot", profitLossSnapshot);
    return profitLossSnapshot;
  }
}
