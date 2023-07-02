import express from "express";
import {
   getParticipant,
   joinQuiz,
   updateParticipant,
} from "../controller/participantController.js";
import userAuth from "../middlewares/authMiddleware.js";
import {
   checkBalance,
   checkParticipant,
} from "../middlewares/quizMiddleware.js";

const router = express.Router();

router.post("/create/:id", userAuth, checkParticipant, checkBalance, joinQuiz);
router.get("/participant/:id", getParticipant);
router.put("/update/:id", userAuth, updateParticipant);

export default router;
