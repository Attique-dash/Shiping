// src/models/Package.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPackage extends Document {
  trackingNumber: string;
  status: 'received' | 'in_transit' | 'delivered' | 'unknown';
  sender: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  recipient: {
    name: string;
    email: string;
    shippingId: string;
    phone?: string;
    address?: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
    weight: number;
    weightUnit: 'kg' | 'lb';
  };
  receivedAt: Date;
  notes?: string;
  history: Array<{
    status: string;
    timestamp: Date;
    notes?: string;
    location?: string;
    updatedBy: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['received', 'in_transit', 'delivered', 'unknown'],
      default: 'received',
      required: true,
    },
    sender: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    recipient: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      shippingId: { type: String, required: true, trim: true, index: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    dimensions: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
      weight: { type: Number, required: true, min: 0 },
      weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
    },
    receivedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        notes: String,
        location: String,
        updatedBy: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Add indexes
PackageSchema.index({ trackingNumber: 1 }, { unique: true });
PackageSchema.index({ 'recipient.shippingId': 1 });
PackageSchema.index({ status: 1 });
PackageSchema.index({ receivedAt: -1 });

// Add a pre-save hook to add history entry when status changes
PackageSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (!this.history) {
      this.history = [];
    }
    this.history.push({
      status: this.status,
      updatedBy: 'system', // In a real app, this would be the user ID
    });
  }
  next();
});

const PackageModel =
  (mongoose.models.Package as mongoose.Model<IPackage>) ||
  mongoose.model<IPackage>('Package', PackageSchema);

export default PackageModel;