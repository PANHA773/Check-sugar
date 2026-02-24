import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      default: null
    },
    birthYear: {
      type: Number,
      min: 1900,
      default: null
    },
    ageGroup: {
      type: String,
      enum: ["children", "adult", "elderly"],
      default: "adult"
    },
    dailySugarLimitG: {
      type: Number,
      default: 25
    },
    profileImage: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
