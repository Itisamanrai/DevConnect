import mongoose, { Document, Schema } from "mongoose";

// interface - defines shape of post
export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId; // ref to User
  post: mongoose.Types.ObjectId; // ref to Post
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who wrote the comment
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // which post it belongs to 
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IComment>("Comment", CommentSchema);
