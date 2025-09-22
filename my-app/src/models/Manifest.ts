import { Schema, model, models } from "mongoose";

export interface IManifest {
  _id?: string;
  manifestId: string;
  description?: string;
  data?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const ManifestSchema = new Schema<IManifest>(
  {
    manifestId: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Manifest = models.Manifest || model<IManifest>("Manifest", ManifestSchema);
