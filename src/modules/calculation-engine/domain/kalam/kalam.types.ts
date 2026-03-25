import { ObjectId } from "mongodb";
import type { DurationMode } from "../../enums/duration-mode.enum";
import type { InterestType } from "../../enums/interest-type.enum";
import type { FunderType } from "../../enums/funder-type.enum";

export interface KalamInterest {
  rate: number;
  type: InterestType;
  compoundFrequency?: string | null;
}

export type SliceStatus = "active" | "closed";

export interface FundingSlice {
  _id: string | ObjectId;
  kalamId: string | ObjectId;
  funderType: FunderType;
  funderId?: string | ObjectId | null;

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

  gracePeriod: number;

  isMigrated: boolean;
  isDraft: boolean;

  expiresAt: string | Date | null;

  voidReason: string | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}
