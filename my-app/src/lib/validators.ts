import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  branch: z.string().optional(),
  serviceTypeIDs: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const addPackageSchema = z.object({
  trackingNumber: z.string().min(1),
  userCode: z.string().min(1),
  weight: z.number().optional(),
  shipper: z.string().optional(),
  description: z.string().optional(),
});

export const updatePackageSchema = z.object({
  trackingNumber: z.string().min(1),
  status: z.enum(["Unknown", "At Warehouse", "In Transit", "Delivered", "Deleted"]),
  note: z.string().optional(),
});

export const deletePackageSchema = z.object({
  trackingNumber: z.string().min(1),
});

export const manifestSchema = z.object({
  manifestId: z.string().min(1),
  description: z.string().optional(),
  data: z.any().optional(),
});
