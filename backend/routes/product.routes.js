import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  getRecommededProducts,
  toggleFeaturedProduct,
  getProductsByCategory,
  deleteProduct,
} from "../controllers/products.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommended", getRecommededProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
