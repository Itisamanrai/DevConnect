import mongoose, { Document, Schema} from "mongoose";

// interface - defines shape of post
export interface IPost extends Document {
    title: string;
    content: string;
    code?: string,                   // optinal code snippet
    author: mongoose.Types.ObjectId;   // ref to User
    likes: mongoose.Types.ObjectId[];  // array of User ids 
    comments: mongoose.Types.ObjectId[];  // array of comment ids 
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            default: '',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // linked to User model
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',    // each like = a user id
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',  // linked to comment model
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);