import { Schema, model, models } from "mongoose";

export interface IFollow {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  followerId: { type: String, required: true, index: true },
  followingId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique follower-following pairs
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = models.Follow || model<IFollow>("Follow", FollowSchema);
export default Follow;
