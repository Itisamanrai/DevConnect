"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// All routes protected with authMiddleware
router.get('/', authMiddleware_1.default, postController_1.getAllPosts);
router.post('/', authMiddleware_1.default, postController_1.createPost);
router.get('/:id', authMiddleware_1.default, postController_1.getPost);
router.delete('/:id', authMiddleware_1.default, postController_1.deletePost);
router.post('/:id/comment', authMiddleware_1.default, postController_1.createComment);
router.post('/:id/like', authMiddleware_1.default, postController_1.toggleLikePost);
exports.default = router;
