import type { DurationResult } from "../calculation-engine/core/duration/duration.types";
import { DurationMode } from "../calculation-engine/enums/duration-mode.enum";
import type { FunderType } from "../calculation-engine/enums/funder-type.enum";
import { InterestType } from "../calculation-engine/enums/interest-type.enum";

export interface KalamInterest {
  rate: number;
  type: InterestType;
  compoundFrequency?: string | null;
}

export type SliceStatus = "active" | "closed";

export interface KalamType {
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

export type PartnerMetrics = Record<FunderType, DurationResult>;
