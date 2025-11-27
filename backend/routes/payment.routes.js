import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createCheckoutSession,
  checkoutSuccess,
} from "../controllers/payment.controller.js";
import express from "express";
const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
