import { Schema, model, models, Types } from "mongoose";

export type PackageStatus =
  | "Unknown"
  | "At Warehouse"
  | "In Transit"
  | "Delivered"
  | "Deleted";

export interface IPackage {
  _id?: string;
  trackingNumber: string;
  userCode: string; // reference to User.userCode
  customer?: Types.ObjectId;
  weight?: number;
  shipper?: string;
  status: PackageStatus;
  description?: string;
  manifestId?: string;
  history: { status: PackageStatus; at: Date; note?: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    userCode: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    weight: { type: Number },
    shipper: { type: String },
    status: {
      type: String,
      enum: ["Unknown", "At Warehouse", "In Transit", "Delivered", "Deleted"],
      default: "Unknown",
      index: true,
    },
    description: { type: String },
    manifestId: { type: String },
    history: [
      {
        status: {
          type: String,
          enum: ["Unknown", "At Warehouse", "In Transit", "Delivered", "Deleted"],
          default: "Unknown",
        },
        at: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Package = models.Package || model<IPackage>("Package", PackageSchema);
