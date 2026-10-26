import express from "express";
import rateLimit from "express-rate-limit";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de commandes envoyées. Veuillez réessayer plus tard."
  }
});

router.post("/", orderLimiter, createOrder);
router.get("/", requireAdmin, getOrders);

export default router;
