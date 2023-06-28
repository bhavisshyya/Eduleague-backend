import express from "express";
import {
   createQuiz,
   getAllQuizes,
   getQuiz,
   updateQuiz,
} from "../controller/quizController.js";
import userAuth from "../middlewares/authMiddleware.js";
import { checkCreator } from "../middlewares/quizMiddleware.js";
const router = express.Router();

router.post("/create", userAuth, createQuiz);
router.get("/get-quizes", getAllQuizes);
router.get("/:id", userAuth, getQuiz);
router.put("/:id", userAuth, updateQuiz);

export default router;
