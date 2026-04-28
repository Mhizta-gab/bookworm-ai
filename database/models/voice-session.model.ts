import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoiceSession extends Document {
  clerkId: string;
  bookId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  billingPeriodStart: Date; // First day of current month — for monthly usage tracking
}

const VoiceSessionSchema = new Schema<IVoiceSession>({
  clerkId: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  startedAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date },
  durationSeconds: { type: Number },
  billingPeriodStart: { type: Date, required: true },
});

// Index for monthly usage queries
VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });

const VoiceSession: Model<IVoiceSession> =
  mongoose.models.VoiceSession ||
  mongoose.model<IVoiceSession>("VoiceSession", VoiceSessionSchema);

export default VoiceSession;
