import express from "express";
import {
   addKyc,
   getUser,
   getUserAuth,
   getWallet,
   updateUser,
} from "../controller/userController.js";
import userAuth from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();

router.post("/get-user-auth", userAuth, getUserAuth);
router.put("/update-user", userAuth, updateUser);
router.get("/get-wallet", userAuth, getWallet);
router.get("/:id", getUser);
router.post("/kyc", userAuth, upload.single("document"), addKyc);
// router.put("/kyc/:id", updateStatus);

export default router;
