import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { normalizeAgePayload } from "../utils/ageSugarProfile.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const { payload: agePayload, error: ageError } = normalizeAgePayload(req.body || {});
    if (ageError) {
      return res.status(400).json({
        message: ageError
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(password), 10);

    const created = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: "user",
      status: "active",
      ...agePayload
    });

    const user = created.toObject();
    delete user.passwordHash;
    return res.status(201).json({ user });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
    if (userDoc.status === "blocked") {
      return res.status(403).json({
        message: "This account is blocked"
      });
    }

    const isValid = await bcrypt.compare(String(password), userDoc.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = userDoc.toObject();
    delete user.passwordHash;
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

export default router;
