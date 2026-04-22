"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const aiController_1 = require("../controllers/aiController");
const router = (0, express_1.Router)();
router.post("/explain", authMiddleware_1.default, aiController_1.explainCode);
exports.default = router;
