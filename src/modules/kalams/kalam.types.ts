import { Types } from "mongoose";
import { DurationMode } from "../calculation-engine/enums/duration-mode.enum";
import { InterestType } from "../calculation-engine/enums/interest-type.enum";
import type { DurationResult } from "../calculation-engine/core/duration/duration.calculator";
import type { FunderType } from "../calculation-engine/enums/funder-type.enum";

export interface KalamInterest {
  rate: number;
  type: InterestType | string;
  compoundFrequency?: string | null;
}

export type SliceStatus = "active" | "closed";

export interface KalamType {
  _id: string | Types.ObjectId;
  kalamCode: string;

  dukandarId: string | Types.ObjectId;
  customerId: string | Types.ObjectId;

  rootKalamId?: string | null | Types.ObjectId;
  renewedFromKalamId?: string | null | Types.ObjectId;
  renewedToKalamId?: string | null | Types.ObjectId;

  renewalCount: number;

  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;

  customerPrincipal: number;

  interest: KalamInterest | null;

  durationType: DurationMode;

  startDate: string | Date;
  endDate?: string | Date | null;

  gracePeriod: number;

  isMigrated: boolean;
  isDraft: boolean;

  expiresAt?: string | Date | null;

  voidReason?: string | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export type PartnerMetrics = Record<FunderType, DurationResult>;
