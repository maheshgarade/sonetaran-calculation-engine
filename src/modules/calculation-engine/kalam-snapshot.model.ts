import { Schema, model, Types, Document } from "mongoose";

export interface RoundedLoanDuration {
  totalMonths: number;
  days: number;
}

export interface PartnerMetrics {
  VYAPARI: RoundedLoanDuration;
  DUKANDAR: RoundedLoanDuration;
  CUSTOMER: RoundedLoanDuration;
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

export interface FundingEntity {
  breakdown: FundingBreakdown[];
  interest: { monthly: number; total: number };
  principal: number;
  total: number;
  roundedLoanDuration: RoundedLoanDuration;
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

export interface LTVDetails {
  usedLTVPercentage: number;
  usedLTVAmount: number;
  availableLTVPercentage: number;
  availableLTVAmount: number;
}

export interface IKalamFinancialSnapshot extends Document {
  kalamId: Types.ObjectId;
  dukandarId: Types.ObjectId; // For tenant isolation

  // Phase 3 Derived Values
  customerDue: number;
  vyapariDue: number;
  dukandarFundingPrincipal: number;
  totalProfit: number;
  durationDays: number; // or periods
  durationString: string;
  valueToday: number;
  balance: number;
  ltv: LTVDetails;
  validTill: Date | null;
  overBorrowedAmt: number;
  overBorrowedMonthlyProfitLoss: number;
  overBorrowedTotalProfitLoss: number;

  lastSyncedAt: Date;
}

// Subdocument schema for LTV
const LTVSchema = new Schema<LTVDetails>(
  {
    usedLTVPercentage: { type: Number, required: true, default: 0 },
    usedLTVAmount: { type: Number, required: true, default: 0 },
    availableLTVPercentage: { type: Number, required: true, default: 0 },
    availableLTVAmount: { type: Number, required: true, default: 0 },
  },
  { _id: false }, // prevent extra _id field
);

const KalamFinancialSnapshotSchema = new Schema<IKalamFinancialSnapshot>(
  {
    kalamId: {
      type: Schema.Types.ObjectId,
      ref: "Kalam",
      required: true,
      unique: true,
    },
    dukandarId: {
      type: Schema.Types.ObjectId,
      ref: "Dukandar",
      required: true,
    },

    // Core Financials
    customerDue: { type: Number, required: true, default: 0 },
    vyapariDue: { type: Number, required: true, default: 0 },
    dukandarFundingPrincipal: { type: Number, required: true, default: 0 }, // Added missing field
    totalProfit: { type: Number, required: true, default: 0 },
    durationDays: { type: Number, required: true, default: 0 },
    durationString: { type: String, required: true, default: "" },
    valueToday: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    ltv: { type: LTVSchema, required: true },
    validTill: { type: Date, required: true },

    // Over Borrowing Risk Fields
    overBorrowedAmt: { type: Number, required: true, default: 0 },
    overBorrowedMonthlyProfitLoss: { type: Number, required: true, default: 0 },
    overBorrowedTotalProfitLoss: { type: Number, required: true, default: 0 },

    lastSyncedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "kalam_financial_snapshots",
  },
);

// Indexes critical for Strategy 2 Filtering & Sorting per Dukandar
KalamFinancialSnapshotSchema.index(
  { dukandarId: 1, kalamId: 1 },
  { unique: true },
);
KalamFinancialSnapshotSchema.index({
  dukandarId: 1,
  "ltv.usedLTVPercentage": -1,
});
KalamFinancialSnapshotSchema.index({
  dukandarId: 1,
  "ltv.availableLTVPercentage": -1,
});
KalamFinancialSnapshotSchema.index({ dukandarId: 1, overBorrowedAmt: -1 });
KalamFinancialSnapshotSchema.index({ dukandarId: 1, totalProfit: -1 });

export const KalamFinancialSnapshot = model<IKalamFinancialSnapshot>(
  "KalamFinancialSnapshot",
  KalamFinancialSnapshotSchema,
);
