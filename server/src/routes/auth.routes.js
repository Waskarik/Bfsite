import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    },
    process.env.SECRET_TOKEN,
    { expiresIn: "7d" },
  );
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const cleanUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 2 || cleanUsername.length > 30) {
      return res.status(400).json({
        message: "Username must have between 2 and 30 characters",
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must have at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: cleanUsername }],
    });

    if (existingUser?.email === normalizedEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: cleanUsername,
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Account already exists" });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Could not login" });
  }
});

router.get("/verify", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ message: "Could not verify session" });
  }
});

export default router;
