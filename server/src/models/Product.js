import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nameKh: {
      type: String,
      required: true,
      trim: true
    },
    nameEn: {
      type: String,
      default: "",
      trim: true
    },
    brand: {
      type: String,
      default: "",
      trim: true
    },
    sugarPer100g: {
      type: Number,
      required: true,
      min: 0
    },
    sugarLevel: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      required: true
    },
    confidence: {
      type: String,
      enum: ["verified", "community", "manual"],
      default: "manual"
    },
    source: {
      type: String,
      enum: ["manual", "scan"],
      default: "manual"
    },
    lastVerifiedAt: {
      type: Date,
      default: null
    },
    defaultServingSizeG: {
      type: Number,
      min: 1,
      default: 100
    },
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
