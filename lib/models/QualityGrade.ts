import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IQualityGradeDocument extends Document {
  organizationId: OrganizationId;
  name: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const QualityGradeSchema = new Schema<IQualityGradeDocument>(
  {
    ...organizationIdField,
    name: { type: String, required: true, index: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

QualityGradeSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const QualityGrade: Model<IQualityGradeDocument> =
  mongoose.models.QualityGrade ||
  mongoose.model<IQualityGradeDocument>("QualityGrade", QualityGradeSchema);

export default QualityGrade;
