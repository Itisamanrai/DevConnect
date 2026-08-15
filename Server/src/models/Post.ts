import mongoose, { Document, Schema} from "mongoose";

export interface IPost extends Document { // it tells TS that Every Post object should look like this.

    title: string;
    content: string;
    code?: string,                   // optinal code snippet
    author: mongoose.Types.ObjectId;   // it stores User_ID, who created this post 
    likes: mongoose.Types.ObjectId[];  // array of User ids 
    comments: mongoose.Types.ObjectId[];  // array of comment ids , not whole comments 
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
            default: '', //  use to handle by frontend that's why we use ' ' instead of NULL
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

export default mongoose.model<IPost>('Post', PostSchema); // this creates the posts collectiob inside a MONGODB