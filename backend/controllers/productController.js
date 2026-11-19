import mongoose from "mongoose";
import Product from "../models/Product.js";

export async function getProducts(req, res, next) {
  try {
    const { search = "", category = "", available } = req.query;
    // Express can parse repeated query parameters as arrays. Ignore malformed
    // values instead of calling string methods on them and returning a 500.
    const searchText = typeof search === "string" ? search.trim() : "";
    const categoryName = typeof category === "string" ? category.trim() : "";
    const filter = {};
    if (searchText) {
      filter.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } }
      ];
    }
    if (categoryName && categoryName !== "Toutes") filter.category = categoryName;
    if (available === "true") filter.available = true;
    if (available === "false") filter.available = false;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Identifiant produit invalide." });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, category, price, description, image, available } = req.body;
    if (!name || !category || price === undefined || price === "") {
      return res.status(400).json({ success: false, message: "Les champs nom, catégorie et prix sont obligatoires." });
    }
    const product = await Product.create({ name, category, price, description, image, available });
    res.status(201).json({ success: true, message: "Produit créé.", data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Identifiant produit invalide." });
    }
    const allowedFields = ["name", "category", "price", "description", "image", "available"];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Aucun champ produit valide à modifier." });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, message: "Produit modifié.", data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Identifiant produit invalide." });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, message: "Produit supprimé.", data: product });
  } catch (error) {
    next(error);
  }
}
