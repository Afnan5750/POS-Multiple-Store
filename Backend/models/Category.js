const mongoose = require("mongoose");

// ===== StoreCategoryCounter Schema (Embedded in same file) =====
const storeCategoryCounterSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail",
      required: true,
    },
    lastCategoryId: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StoreCategoryCounter = mongoose.model(
  "StoreCategoryCounter",
  storeCategoryCounterSchema
);

// ===== Category Schema =====
const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: Number, unique: true }, // Auto-incremented ID
    categoryName: { type: String, required: true, unique: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Detail",
      required: true,
    },
  },
  { timestamps: true }
);

// ===== Pre-save hook for auto-increment categoryId per store =====
categorySchema.pre("save", async function (next) {
  if (this.isNew) {
    const storeId = this.storeId;

    // Find the counter for this store
    let storeCategoryCounter = await StoreCategoryCounter.findOne({ storeId });

    if (!storeCategoryCounter) {
      // If not exists, create new counter
      storeCategoryCounter = new StoreCategoryCounter({
        storeId,
        lastCategoryId: 1,
      });
      await storeCategoryCounter.save();
      this.categoryId = 1;
    } else {
      // Increment and update counter
      storeCategoryCounter.lastCategoryId += 1;
      await storeCategoryCounter.save();
      this.categoryId = storeCategoryCounter.lastCategoryId;
    }
  }

  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
