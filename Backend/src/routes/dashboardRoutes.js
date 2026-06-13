import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAuthToken, getDashboardStats);

export default router;
