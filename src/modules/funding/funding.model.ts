import { model, Schema, Types } from "mongoose";
import { FunderType } from "../calculation-engine/enums/funder-type.enum";
import { InterestType } from "../calculation-engine/enums/interest-type.enum";
import { DurationMode } from "../calculation-engine/enums/duration-mode.enum";

const InterestSchema = new Schema(
  {
    rate: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(InterestType),
      required: true,
    },
    compoundFrequency: { type: String, default: null },
    extraMonths: { type: Number, default: null },
  },
  { _id: false },
);

const TermsSchema = new Schema(
  {
    duration: {
      type: String,
      enum: Object.values(DurationMode),
      default: "MONTHLY_15",
      required: true,
    },
    graceDays: { type: Number, default: null }, // optional or null
  },
  { _id: false },
);

const KalamFundingSchema = new Schema(
  {
    kalamId: { type: Types.ObjectId, ref: "Kalam", required: true },
    funderType: {
      type: String,
      enum: Object.values(FunderType),
      required: true,
    },
    funderId: { type: Types.ObjectId, default: null },
    fundingPrincipal: { type: Number, required: true },
    interest: { type: InterestSchema, required: true },
    terms: { type: TermsSchema, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

// Optimize funding lookups
KalamFundingSchema.index({ kalamId: 1 });
KalamFundingSchema.index({ funderId: 1 });

export const KalamFunding = model("KalamFunding", KalamFundingSchema);
