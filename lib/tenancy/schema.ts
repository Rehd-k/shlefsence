import { Schema, Types } from "mongoose";

/** Standard tenant ownership field for every domain document. */
export const organizationIdField = {
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },
} as const;

export type OrganizationId = Types.ObjectId | string;

export interface WithOrganizationId {
  organizationId: OrganizationId;
}
