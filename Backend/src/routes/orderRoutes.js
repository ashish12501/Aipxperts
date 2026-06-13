import express from "express";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orders.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyAuthToken, createOrder);
router.get("/", verifyAuthToken, getAllOrders);
router.patch("/:id/status", verifyAuthToken, updateOrderStatus);

export default router;
