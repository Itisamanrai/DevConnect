"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikePost = exports.deletePost = exports.getPost = exports.createPost = exports.createComment = exports.getAllPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const User_1 = __importDefault(require("../models/User"));
// GET ALL POSTS (FEED)
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.default.find()
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getAllPosts = getAllPosts;
// CREATE COMMENT
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { content } = req.body;
        const postId = String(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!content || content.trim() === "") {
            res.status(400).json({ message: "Comment content is required" });
            return;
        }
        const post = yield Post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        const comment = yield Comment_1.default.create({
            content: content.trim(),
            author: userId,
            post: postId,
        });
        yield Post_1.default.findByIdAndUpdate(postId, {
            $push: { comments: comment._id },
        });
        res.status(201).json({
            message: "Comment added successfully",
            comment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createComment = createComment;
// CREATE POST
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, code } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // VALIDATE FIELDS
        if (!title || !content) {
            res.status(400).json({ message: "Title and content are required" });
            return;
        }
        // CREATE NEW POST
        const newPost = new Post_1.default({
            title,
            content,
            code: code || "",
            author: userId,
            likes: [],
            comments: [],
        });
        // SAVE POST IN DB
        const savedPost = yield newPost.save();
        // LINK POST TO USER
        yield User_1.default.findByIdAndUpdate(userId, {
            $push: { posts: savedPost._id },
        });
        res.status(201).json({
            message: "Post created successfully",
            post: savedPost,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createPost = createPost;
// GET SINGLE POST
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getPost = getPost;
// DELETE POST
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const post = yield Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // Only author can delete
        if (post.author.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        yield post.deleteOne();
        // Remove post from user's posts array
        yield User_1.default.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, {
            $pull: { posts: req.params.id },
        });
        res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.deletePost = deletePost;
// LIKE / UNLIKE POST
const toggleLikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const postId = String(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const post = yield Post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        const alreadyLiked = post.likes.some((id) => id.toString() === userId);
        const updatedPost = alreadyLiked
            ? yield Post_1.default.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
            : yield Post_1.default.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });
        if (!updatedPost) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            liked: !alreadyLiked,
            post: updatedPost,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.toggleLikePost = toggleLikePost;
