import express from "express";
import {
   createQuiz,
   getAllQuizes,
   getQuiz,
   updateQuiz,
   userAnalysis,
} from "../controller/quizController.js";
import userAuth from "../middlewares/authMiddleware.js";
import { checkBalance } from "../middlewares/quizMiddleware.js";
const router = express.Router();

router.post("/create", userAuth, checkBalance, createQuiz);
router.get("/get-quizes", userAuth, getAllQuizes);
router.get("/analysis", userAuth, userAnalysis);
router.get("/:id", userAuth, getQuiz);
router.put("/:id", updateQuiz);


export default router;
