import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/authMiddleware";

// FOR SIGNUP
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
    
        // CHECK IF USER ALREADY exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            res.status(400).json({ message: "User already exists"});
            return;
        }

        // HASH password

        // CREATE NEW USER
        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();

        // GENERATE Jwt
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
    try{
        const { email, password } = req.body;

        // CHECK IF USER exists
        const user = await User.findOne({ email });
        if(!user){
            res.status(400).json({ message: "Invalid credentials"});
            return;
        }

        // COMPARE PASSWORD
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            res.status(400).json({ message: "Invalid credentials"});
            return;
        }

        // GENERATE JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
            },
        });
    } catch (error){
        res.status(500).json({ message: "Server error", error});
    }
};

// GET PROFILE
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId).select("name email createdAt");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const posts = await Post.find({ author: userId })
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
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};