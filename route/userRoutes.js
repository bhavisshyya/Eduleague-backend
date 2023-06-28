import express from "express";
import {
   getUser,
   getWallet,
   updateUser,
} from "../controller/userController.js";
import userAuth from "../middlewares/authMiddleware.js";
const router = express.Router();

router.put("/update-user", userAuth, updateUser);
router.get("/get-wallet", userAuth, getWallet);
router.get("/:id", getUser);

export default router;
