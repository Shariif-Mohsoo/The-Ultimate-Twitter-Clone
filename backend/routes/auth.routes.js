import express from "express";

import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";

const router = express.Router();

// to check whether the user is authorized or not.
router.get("/me", protectRoute, getMe);
// to signup for the user
router.post("/signup", signup);
// to login the user
router.post("/login", login);
// to logout the user.
router.post("/logout", logout);
export default router;
