import express from "express";
import {
   createQuiz,
   getAllQuizes,
   getQuiz,
} from "../controller/quizController.js";
import userAuth from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", userAuth, createQuiz);
router.get("/get-quizes", getAllQuizes);
router.get("/:id", getQuiz);

export default router;
