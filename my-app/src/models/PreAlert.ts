import { Schema, model, models, Types } from "mongoose";

export interface IPreAlert {
  _id?: string;
  userCode: string;
  customer?: Types.ObjectId;
  trackingNumber: string;
  carrier?: string;
  origin?: string;
  expectedDate?: Date | null;
  notes?: string;
  status?: "submitted" | "approved" | "rejected";
  decidedBy?: Types.ObjectId | null;
  decidedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const PreAlertSchema = new Schema<IPreAlert>(
  {
    userCode: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    trackingNumber: { type: String, required: true },
    carrier: { type: String },
    origin: { type: String },
    expectedDate: { type: Date },
    notes: { type: String },
    status: { type: String, enum: ["submitted", "approved", "rejected"], default: "submitted", index: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

export const PreAlert = models.PreAlert || model<IPreAlert>("PreAlert", PreAlertSchema);
