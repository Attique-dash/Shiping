import { Schema, model, models } from "mongoose";

export type UserRole = "admin" | "customer";

export interface IUser {
  _id?: string;
  userCode: string; // external code used by warehouse
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  branch?: string;
  serviceTypeIDs?: string[];
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userCode: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    branch: { type: String },
    serviceTypeIDs: [{ type: String }],
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
