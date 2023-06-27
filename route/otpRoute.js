import express from "express";
import { otpController } from "../controller/otpContoller.js";
const router = express.Router();

router.post("/otpVerify", otpController);

export default router;
