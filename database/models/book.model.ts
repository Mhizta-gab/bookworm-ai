import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  clerkId: string;
  title: string;
  author: string;
  slug: string;
  persona: string; // ElevenLabs voice ID
  fileUrl: string;
  fileBlobKey?: string;
  coverUrl: string;
  coverBlobKey?: string;
  fileSize: number;
  totalSegments: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    clerkId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    persona: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileBlobKey: { type: String },
    coverUrl: { type: String, required: true },
    coverBlobKey: { type: String },
    fileSize: { type: Number, required: true },
    totalSegments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
