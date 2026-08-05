import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQualityGradeDocument extends Document {
  name: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const QualityGradeSchema = new Schema<IQualityGradeDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

const QualityGrade: Model<IQualityGradeDocument> =
  mongoose.models.QualityGrade || mongoose.model<IQualityGradeDocument>("QualityGrade", QualityGradeSchema);

export default QualityGrade;
