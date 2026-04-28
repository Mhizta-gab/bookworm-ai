import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  bookId: mongoose.Types.ObjectId;
  clerkId: string;
  content: string;
  likes: string[]; // array of clerkIds
  parentId?: mongoose.Types.ObjectId; // for threaded replies
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    clerkId: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: [String], default: [] },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
