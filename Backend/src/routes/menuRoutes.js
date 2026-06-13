import express from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  updateMenuItem,
} from "../controllers/menu.controllers.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAuthToken, getAllMenuItems);
router.post("/", verifyAuthToken, createMenuItem);
router.put("/:id", verifyAuthToken, updateMenuItem);
router.delete("/:id", verifyAuthToken, deleteMenuItem);

export default router;
