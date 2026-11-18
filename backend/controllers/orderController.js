import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderNotification } from "../services/orderEmail.js";
import { sendOrderSmsNotification } from "../services/orderSms.js";

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

    const [emailResult, smsResult] = await Promise.allSettled([
      sendOrderNotification(order),
      sendOrderSmsNotification(order)
    ]);

    order.emailNotification = emailResult.status === "fulfilled" ? emailResult.value : "failed";
    if (emailResult.status === "rejected") {
      console.error(
        `Order email notification ${order._id} failed:`,
        emailResult.reason
      );
    }
    order.smsNotification = smsResult.status === "fulfilled" ? smsResult.value : "failed";
    if (smsResult.status === "rejected") {
      console.error(`Order SMS notification ${order._id} failed:`, smsResult.reason);
    }
    await order.save();

    const sentNotifications = [order.emailNotification, order.smsNotification].filter((status) => status === "sent");
    const message = sentNotifications.length === 2
      ? "Votre commande a ete enregistree et transmise a BS3 par e-mail et SMS."
      : order.smsNotification === "sent"
        ? "Votre commande a ete enregistree et une notification SMS a ete transmise a BS3."
        : order.emailNotification === "sent"
          ? "Votre commande a ete enregistree et transmise a BS3 par e-mail."
          : "Votre commande a ete enregistree. BS3 la retrouvera dans l'espace administrateur.";

    res.status(201).json({
      success: true,
      message,
      data: {
        id: order._id,
        emailNotification: order.emailNotification,
        smsNotification: order.smsNotification
      }
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
