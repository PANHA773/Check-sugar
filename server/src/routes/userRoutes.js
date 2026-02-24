import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { normalizeAgePayload } from "../utils/ageSugarProfile.js";

const router = express.Router();

const MAX_PROFILE_IMAGE_LENGTH = 1_500_000;

function normalizeProfileImage(value) {
  if (value == null) return "";
  const normalized = String(value).trim();
  if (!normalized) return "";
  return normalized.slice(0, MAX_PROFILE_IMAGE_LENGTH);
}

router.get("/stats/summary", async (_req, res, next) => {
  try {
    const [totalUsers, adminCount, userCount, activeCount, blockedCount, childrenCount, adultCount, elderlyCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "blocked" }),
      User.countDocuments({ ageGroup: "children" }),
      User.countDocuments({ ageGroup: "adult" }),
      User.countDocuments({ ageGroup: "elderly" })
    ]);

    return res.json({
      totalUsers,
      adminCount,
      userCount,
      activeCount,
      blockedCount,
      childrenCount,
      adultCount,
      elderlyCount
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { role: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
        { ageGroup: { $regex: q, $options: "i" } }
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/profile", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const hasName = req.body?.name !== undefined;
    const hasEmail = req.body?.email !== undefined;
    const hasPassword = req.body?.password !== undefined;
    const hasProfileImage = req.body?.profileImage !== undefined;

    if (!hasName && !hasEmail && !hasPassword && !hasProfileImage) {
      return res.status(400).json({
        message: "No profile changes provided"
      });
    }

    if (hasName) {
      const nextName = String(req.body?.name || "").trim();
      if (!nextName) {
        return res.status(400).json({
          message: "Name is required"
        });
      }
      existing.name = nextName;
    }

    if (hasEmail) {
      const nextEmail = String(req.body?.email || "").trim().toLowerCase();
      if (!nextEmail) {
        return res.status(400).json({
          message: "Email is required"
        });
      }
      existing.email = nextEmail;
    }

    if (hasPassword) {
      const nextPassword = String(req.body?.password || "").trim();
      if (nextPassword.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters"
        });
      }
      existing.passwordHash = await bcrypt.hash(nextPassword, 10);
    }

    if (hasProfileImage) {
      existing.profileImage = normalizeProfileImage(req.body?.profileImage);
    }

    await existing.save();

    const output = existing.toObject();
    delete output.passwordHash;
    return res.json(output);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;
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
      role: role === "admin" ? "admin" : "user",
      status: status === "blocked" ? "blocked" : "active",
      profileImage: normalizeProfileImage(req.body?.profileImage),
      ...agePayload
    });

    const output = created.toObject();
    delete output.passwordHash;
    return res.status(201).json(output);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { payload: agePayload, error: ageError } = normalizeAgePayload(req.body || {}, existing);
    if (ageError) {
      return res.status(400).json({
        message: ageError
      });
    }

    const nextRole = role === "admin" ? "admin" : "user";
    if (existing.role === "admin" && nextRole !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "At least one admin account must remain"
        });
      }
    }

    existing.name = String(name).trim();
    existing.email = String(email).trim().toLowerCase();
    existing.role = nextRole;
    existing.status = status === "blocked" ? "blocked" : "active";
    existing.age = agePayload.age;
    existing.birthYear = agePayload.birthYear;
    existing.ageGroup = agePayload.ageGroup;
    existing.dailySugarLimitG = agePayload.dailySugarLimitG;
    if (req.body?.profileImage !== undefined) {
      existing.profileImage = normalizeProfileImage(req.body?.profileImage);
    }

    if (password && String(password).trim().length > 0) {
      existing.passwordHash = await bcrypt.hash(String(password), 10);
    }

    await existing.save();
    const output = existing.toObject();
    delete output.passwordHash;
    return res.json(output);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await User.findById(id).lean();
    if (!existing) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (existing.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "At least one admin account must remain"
        });
      }
    }

    await User.findByIdAndDelete(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
