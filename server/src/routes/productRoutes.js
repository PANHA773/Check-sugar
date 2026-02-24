import express from "express";
import Product from "../models/Product.js";
import { getSugarLevel } from "../utils/sugarLevel.js";

const router = express.Router();

const VALID_CONFIDENCE = new Set(["verified", "community", "manual"]);

function parseConfidence(value) {
  const normalized = String(value || "manual").trim().toLowerCase();
  return VALID_CONFIDENCE.has(normalized) ? normalized : "manual";
}

function parseDateOrNull(value) {
  if (value == null || String(value).trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseServingSize(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return 100;
  return parsed;
}

function normalizeProduct(product) {
  const item = product?.toObject ? product.toObject() : { ...product };
  const servingSize = parseServingSize(item.defaultServingSizeG);
  const sugarPer100g = Number(item.sugarPer100g) || 0;
  const sugarPerServingG = Number(((sugarPer100g * servingSize) / 100).toFixed(2));

  return {
    ...item,
    defaultServingSizeG: servingSize,
    sugarPerServingG
  };
}

function extractSugarFromText(text) {
  const patterns = [
    /(?:total\s+)?sugars?\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*g/i,
    /(\d+(?:[.,]\d+)?)\s*g\s*(?:total\s+)?sugars?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const value = Number(String(match[1]).replace(",", "."));
    if (Number.isNaN(value) || value < 0) continue;

    return {
      sugarPer100g: Number(value.toFixed(1)),
      matchedText: match[0]
    };
  }

  return {
    sugarPer100g: null,
    matchedText: null
  };
}

function buildProductPayload(body, existing = null) {
  const barcode = String(body.barcode || existing?.barcode || "").trim();
  const nameKh = String(body.nameKh || existing?.nameKh || "").trim();
  const sugarPer100g = Number(body.sugarPer100g ?? existing?.sugarPer100g);
  const sugarLevel = getSugarLevel(sugarPer100g);

  if (!barcode || !nameKh || sugarLevel === "unknown") {
    return {
      error: "Invalid data"
    };
  }

  const confidence = parseConfidence(body.confidence ?? existing?.confidence);
  let lastVerifiedAt = parseDateOrNull(body.lastVerifiedAt);

  if (body.lastVerifiedAt === undefined && existing?.lastVerifiedAt) {
    lastVerifiedAt = existing.lastVerifiedAt;
  }

  if (confidence === "verified" && !lastVerifiedAt) {
    lastVerifiedAt = new Date();
  }

  if (confidence !== "verified" && body.lastVerifiedAt === undefined) {
    lastVerifiedAt = null;
  }

  return {
    payload: {
      barcode,
      nameKh,
      nameEn: body.nameEn != null ? String(body.nameEn).trim() : existing?.nameEn || "",
      brand: body.brand != null ? String(body.brand).trim() : existing?.brand || "",
      sugarPer100g,
      sugarLevel,
      confidence,
      source: body.source ? String(body.source).trim() : existing?.source || "manual",
      lastVerifiedAt,
      defaultServingSizeG: parseServingSize(body.defaultServingSizeG ?? existing?.defaultServingSizeG),
      notes: body.notes != null ? String(body.notes).trim() : existing?.notes || ""
    }
  };
}

router.get("/stats/summary", async (_req, res, next) => {
  try {
    const [totalProducts, lowSugar, mediumSugar, highSugar, verifiedCount, communityCount, manualCount] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ sugarLevel: "low" }),
      Product.countDocuments({ sugarLevel: "medium" }),
      Product.countDocuments({ sugarLevel: "high" }),
      Product.countDocuments({ confidence: "verified" }),
      Product.countDocuments({ confidence: "community" }),
      Product.countDocuments({ confidence: "manual" })
    ]);

    return res.json({
      totalProducts,
      lowSugar,
      mediumSugar,
      highSugar,
      verifiedCount,
      communityCount,
      manualCount
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/barcode/:barcode", async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ barcode }).lean();
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    return res.json(normalizeProduct(product));
  } catch (error) {
    return next(error);
  }
});

router.post("/ocr/estimate", async (req, res, next) => {
  try {
    const labelText = String(req.body?.labelText || "").trim();
    if (!labelText) {
      return res.status(400).json({
        message: "labelText is required"
      });
    }

    const extracted = extractSugarFromText(labelText);
    return res.json({
      status: "stub",
      message: "Image OCR is not enabled yet. Text parsing beta was used.",
      extracted,
      confidence: extracted.sugarPer100g == null ? "manual" : "community",
      parsedAt: new Date().toISOString()
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
        { barcode: { $regex: q, $options: "i" } },
        { nameKh: { $regex: q, $options: "i" } },
        { nameEn: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { confidence: { $regex: q, $options: "i" } }
      ];
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    return res.json({
      items: items.map((item) => normalizeProduct(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { payload, error: payloadError } = buildProductPayload(req.body || {});

    if (payloadError) {
      return res.status(400).json({
        message: payloadError
      });
    }

    const created = await Product.create(payload);
    return res.status(201).json(normalizeProduct(created));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Barcode already exists"
      });
    }
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Product.findById(id).lean();

    if (!existing) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const { payload, error: payloadError } = buildProductPayload(req.body || {}, existing);

    if (payloadError) {
      return res.status(400).json({
        message: payloadError
      });
    }

    const updated = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    return res.json(normalizeProduct(updated));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Barcode already exists"
      });
    }
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
