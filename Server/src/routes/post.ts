import { Router } from "express";
import {
    createPost,
    createComment,
    getAllPosts,
    getPost,
    deletePost,
    toggleLikePost,
} from '../controllers/postController';
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// All routes protected with authMiddleware
router.get('/', authMiddleware, getAllPosts);
router.post('/', authMiddleware, createPost);
router.get('/:id', authMiddleware, getPost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/comment', authMiddleware, createComment);
router.post('/:id/like', authMiddleware, toggleLikePost);

export default router;