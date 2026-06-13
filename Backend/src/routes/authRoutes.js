import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/getMe", verifyAuthToken, getMe);

export default router;
