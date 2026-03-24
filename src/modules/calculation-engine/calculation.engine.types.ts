import { ObjectId } from "mongodb";

export type DurationMode =
  | "DAILY"
  | "DAYS_7"
  | "DAYS_15"
  | "MONTHLY"
  | "MONTHLY_15";

export type InterestType =
  | "simple"
  | "compound"
  | "custom"
  | "SIMPLE"
  | "COMPOUND"
  | "CUSTOM";

export interface DurationResult {
  totalMonths: number;
  days: number;
}

export interface KalamInterest {
  rate: number;
  type: InterestType;
  compoundFrequency?: string | null;
}

export type SliceStatus = "active" | "closed";

export interface FundingSlice {
  _id: string | ObjectId;
  kalamId: string | ObjectId;
  funderType: "VYAPARI" | "DUKANDAR" | string;
  funderId?: string | ObjectId | null;
  fundingPrincipal: number;
  interest: KalamInterest;
  terms: {
    duration: DurationMode | string;
    graceDays?: number | null;
  };
  startDate: Date | string;
  endDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Kalam {
  _id: string;
  kalamCode: string;
  dukandarId: string;
  customerId: string;
  rootKalamId: string;
  renewedFromKalamId: string | null;
  renewedToKalamId: string | null;
  renewalCount: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  customerPrincipal: number;
  interest: KalamInterest;
  durationType: DurationMode;
  startDate: string | Date;
  endDate: string | Date | null;
  isMigrated: boolean;
  gracePeriod: number;
  voidReason: string | null;
  isDraft: boolean;
  expiresAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
