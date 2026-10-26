import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true, trim: true },
      category: { type: String, required: true, trim: true },
      unitPrice: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1, max: 100 }
    }],
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 40 },
      email: { type: String, default: "", trim: true, maxlength: 254 },
      address: { type: String, required: true, trim: true, maxlength: 500 },
      notes: { type: String, default: "", trim: true, maxlength: 1000 }
    },
    product: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String, trim: true },
      category: { type: String, trim: true },
      unitPrice: { type: Number, min: 0 }
    },
    quantity: { type: Number, min: 1, max: 100 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["new", "processing", "completed", "cancelled"], default: "new" },
    emailNotification: {
      type: String,
      enum: ["sent", "failed", "not_configured"],
      default: "not_configured"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
