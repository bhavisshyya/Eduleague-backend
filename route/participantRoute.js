import express from "express";
import { createParticipant } from "../controller/participantController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create/:id", userAuth, createParticipant);

export default router;
