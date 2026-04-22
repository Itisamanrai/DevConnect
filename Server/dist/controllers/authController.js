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
exports.getProfile = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
// FOR SIGNUP
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // CHECK IF USER ALREADY exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // HASH password
        // CREATE NEW USER
        const newUser = new User_1.default({
            name,
            email,
            password,
        });
        yield newUser.save();
        // GENERATE Jwt
        const token = jsonwebtoken_1.default.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.signup = signup;
// LOGIN
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // CHECK IF USER exists
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        // COMPARE PASSWORD
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        // GENERATE JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.login = login;
// GET PROFILE
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield User_1.default.findById(userId).select("name email createdAt");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const posts = yield Post_1.default.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate("author", "name email")
            .populate({
            path: "comments",
            populate: {
                path: "author",
                select: "name",
            },
        });
        res.status(200).json({ user, posts });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getProfile = getProfile;
