import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderNotification } from "../services/orderEmail.js";

function validEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createOrder(req, res, next) {
  try {
    const { customer } = req.body;
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : [{ productId: req.body.productId, quantity: req.body.quantity }];
    if (
      items.length < 1 ||
      items.length > 50 ||
      items.some((item) =>
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) ||
      !customer ||
      typeof customer.name !== "string" ||
      !customer.name.trim() ||
      typeof customer.phone !== "string" ||
      !customer.phone.trim() ||
      typeof customer.address !== "string" ||
      !customer.address.trim() ||
      typeof (customer.email ?? "") !== "string" ||
      typeof (customer.notes ?? "") !== "string" ||
      customer.name.trim().length > 120 ||
      customer.phone.trim().length > 40 ||
      customer.address.trim().length > 500 ||
      (customer.email ?? "").trim().length > 254 ||
      (customer.notes ?? "").trim().length > 1000 ||
      !validEmail((customer.email ?? "").trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Veuillez vérifier les informations de commande."
      });
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds }, available: true });
    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "Un ou plusieurs produits sont indisponibles ou n'existent plus."
      });
    }

    const productById = new Map(products.map((product) => [product._id.toString(), product]));
    const orderItems = items.map((item) => {
      const product = productById.get(item.productId);
      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        unitPrice: product.price,
        quantity: item.quantity
      };
    });

    const order = await Order.create({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: (customer.email ?? "").trim(),
        address: customer.address.trim(),
        notes: (customer.notes ?? "").trim()
      },
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    });

    try {
      order.emailNotification = await sendOrderNotification(order);
    } catch (emailError) {
      order.emailNotification = "failed";
      console.error(`E-mail de notification de commande ${order._id} non envoyé :`, emailError);
    }
    await order.save();

    res.status(201).json({
      success: true,
      message: order.emailNotification === "sent"
        ? "Votre commande a été enregistrée et transmise à BS3."
        : "Votre commande a été enregistrée. L'e-mail de notification n'a pas pu être envoyé ; BS3 la retrouvera dans l'espace administrateur.",
      data: { id: order._id, emailNotification: order.emailNotification }
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
}
