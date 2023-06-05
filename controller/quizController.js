import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";

export const createQuiz = async (req, res) => {
   const { course, subject, topic, entryCoins } = req.body;
   const creator = req.user.userId;
   if (!course || !entryCoins) {
      return res
         .status(400)
         .json({ error: "Course and entryCoins are required parameters" });
   }

   const filter = { course };
   if (subject) filter.subject = subject;
   if (topic) filter.topic = topic;

   const questions = await Question.find(filter);

   if (questions.length === 0) {
      return res
         .status(404)
         .json({ error: "No questions available for the chosen filters" });
   }

   // Create a new quiz
   const quiz = new Quiz({
      creator,
      course,
      subject: subject || null,
      topic: topic || null,
      questions: questions.map((question) => question._id),
      entryCoins,
   });

   await quiz.save();

   await quiz.populate("questions");

   res.status(201).json({ message: "Quiz created successfully", quiz });
};

//  get single Quiz

export const getQuiz = async (req, res) => {
   const id = req.params.id;

   const quiz = await Quiz.findById(id)
      .populate("questions")
      .populate("creator")
      .populate({
         path: "participants",
         match: { isCompleted: true },
         populate: {
            path: "user",
            model: "User",
         },
      });

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   res.status(200).json(quiz);
};

//  Get All Quizs

export const getAllQuizes = async (req, res) => {
   const quizs = await Quiz.find({ isCompleted: true })
      .populate("creator")
      .sort("-startTime");

   res.status(200).json({ quizs });
};

// update quiz (end quiz)
export const updateQuiz = async (req, res, next) => {
   const { id } = req.params;
   const endTime = Date.now();
   const quiz = await Quiz.findByIdAndUpdate(
      { _id: id },
      { endTime, isCompleted: true },
      { new: true }
   );

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }
   res.json(quiz);
};
