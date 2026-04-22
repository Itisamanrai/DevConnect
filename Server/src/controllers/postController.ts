import { Response } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

// GET ALL POSTS (FEED)
export const getAllPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// CREATE COMMENT
export const createComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content } = req.body;
    const postId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!content || content.trim() === "") {
      res.status(400).json({ message: "Comment content is required" });
      return;
    }
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: userId,
      post: postId,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// CREATE POST
export const createPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, content, code } = req.body;
    const userId = req.user?.id;

    // VALIDATE FIELDS
    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    // CREATE NEW POST
    const newPost = new Post({
      title,
      content,
      code: code || "",
      author: userId,
      likes: [],
      comments: [],
    });

    // SAVE POST IN DB
    const savedPost = await newPost.save();

    // LINK POST TO USER
    await User.findByIdAndUpdate(userId, {
      $push: { posts: savedPost._id },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET SINGLE POST
export const getPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email") // get author details
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name", // GET COMMENTER DETAILS
        },
      });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE POST
export const deletePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Only author can delete
    if (post.author.toString() !== req.user?.id) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await post.deleteOne();

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user?.id, {
      $pull: { posts: req.params.id },
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// LIKE / UNLIKE POST
export const toggleLikePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    const updatedPost = alreadyLiked
      ? await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
      : await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });

    if (!updatedPost) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      liked: !alreadyLiked,
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
