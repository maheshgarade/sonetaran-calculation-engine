import { Types } from "mongoose";
import { DurationMode } from "../calculation-engine/enums/duration-mode.enum";
import { FunderType } from "../calculation-engine/enums/funder-type.enum";
import type { DurationResult } from "../calculation-engine/core/duration/duration.calculator";
import type { KalamInterest } from "../kalams/kalam.types";

export interface FundingSlice {
  _id: string | Types.ObjectId;
  kalamId: string | Types.ObjectId;
  funderType: FunderType;
  funderId?: string | Types.ObjectId | null;

  fundingPrincipal: number;

  interest: KalamInterest;

  terms: {
    duration: DurationMode;
    graceDays?: number | null;
  };

  startDate: Date | string;
  endDate?: Date | string | null;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FundingData {
  fundingDue: {
    customer?: FundingEntity;
    vyapari?: FundingEntity;
    dukandar?: FundingEntity;
    overBorrowed?: FundingEntity;
  };
  totalFundingDue: number;
  monthlyProfit: number;
  totalProfit: number;
}

export interface FundingEntity {
  breakdown: FundingBreakdown[];
  interest: { monthly: number; total: number };
  principal: number;
  total: number;
  roundedLoanDuration: DurationResult;
}

export interface FundingBreakdown {
  duration: number;
  interest: number;
  principal: number;
  rate: number;
  roi: number;
  total: number;
  unit: string;
}
