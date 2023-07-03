import express from "express";
import {
   getUser,
   getUserAuth,
   getWallet,
   updateUser,
} from "../controller/userController.js";
import userAuth from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/get-user-auth", userAuth, getUserAuth);
router.put("/update-user", userAuth, updateUser);
router.get("/get-wallet", userAuth, getWallet);
router.get("/:id", getUser);

export default router;
