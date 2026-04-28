import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookSegment extends Document {
  clerkId: string;
  bookId: mongoose.Types.ObjectId;
  content: string; // text-indexed for full-text search
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

const BookSegmentSchema = new Schema<IBookSegment>({
  clerkId: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  content: { type: String, required: true },
  segmentIndex: { type: Number, required: true },
  pageNumber: { type: Number },
  wordCount: { type: Number, default: 0 },
});

// Compound index for ordered retrieval
BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 });

// Text index on content for MongoDB full-text search (used by /api/vapi/search-book)
BookSegmentSchema.index({ content: "text" });

const BookSegment: Model<IBookSegment> =
  mongoose.models.BookSegment ||
  mongoose.model<IBookSegment>("BookSegment", BookSegmentSchema);

export default BookSegment;
