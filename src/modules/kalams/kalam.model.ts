import { Schema, model, Types } from "mongoose";
import { DurationMode } from "../calculation-engine/enums/duration-mode.enum";

export const InterestSchema = new Schema(
  {
    rate: { type: Number, required: true },
    type: {
      type: String,
      enum: ["SIMPLE", "COMPOUND", "CUSTOM"],
      required: true,
    },
    compoundFrequency: {
      type: String,
      enum: ["ANNUALLY"],
      default: "ANNUALLY",
    },
    extraMonths: { type: Number, default: null },
  },
  { _id: false },
);

const KalamSchema = new Schema(
  {
    kalamCode: { type: String, required: true, unique: true },
    dukandarId: { type: Types.ObjectId, ref: "Dukandar", required: true },
    customerId: { type: Types.ObjectId, ref: "Customer", required: true },
    rootKalamId: { type: Types.ObjectId },
    renewedFromKalamId: { type: Types.ObjectId, ref: "Kalam", default: null },
    renewedToKalamId: { type: Types.ObjectId, ref: "Kalam", default: null },
    renewalCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "RENEWED", "CLOSED", "FORCE_CLOSED"],
      required: true,
    },
    customerPrincipal: { type: Number, required: true },
    interest: { type: InterestSchema, required: true },
    durationType: {
      type: String,
      enum: Object.values(DurationMode),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isMigrated: { type: Boolean, default: false },
    gracePeriod: { type: Number, default: 0 }, // In days
    voidReason: { type: String, default: null }, // If voided
    isDraft: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }, // MongoDB TTL indexing field
  },
  { timestamps: true, versionKey: false },
);

// Indexes for Dashboard performance
KalamSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL Auto-cleanup for drafts
KalamSchema.index({ dukandarId: 1, status: 1 }); // Active loans query
KalamSchema.index({ dukandarId: 1, status: 1, startDate: -1 }); // Recent activity
KalamSchema.index({ customerId: 1 }); // Lookups
KalamSchema.index({ kalamCode: 1 }, { unique: true }); // Ensure uniqueness

export const KalamModel = model("Kalam", KalamSchema);
