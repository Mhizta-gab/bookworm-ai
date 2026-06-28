import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSubscription extends Document {
  clerkId: string;
  plan: "free" | "standard" | "pro";
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  paystackReference?: string;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>({
  clerkId: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["free", "standard", "pro"], default: "free", required: true },
  paystackCustomerCode: { type: String },
  paystackSubscriptionCode: { type: String },
  paystackReference: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const UserSubscription: Model<IUserSubscription> =
  mongoose.models.UserSubscription ||
  mongoose.model<IUserSubscription>("UserSubscription", UserSubscriptionSchema);

export default UserSubscription;
