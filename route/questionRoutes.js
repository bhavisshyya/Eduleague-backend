import express from "express";
import {
   createQuestion,
   selectQuestions,
} from "../controller/questionController.js";
const router = express.Router();

router.post("/create", createQuestion);
router.get("/get-questions", selectQuestions);

export default router;
