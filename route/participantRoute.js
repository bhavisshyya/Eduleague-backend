import express from "express";
import {
   createParticipant,
   getParticipant,
   updateParticipant,
} from "../controller/participantController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create/:id", userAuth, createParticipant);
router.get("/participant/:id", getParticipant);
router.put("/update/:id", userAuth, updateParticipant);

export default router;
