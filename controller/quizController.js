import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";
import Participant from "../models/participantModel.js";
import User from "../models/userModel.js";

export const createQuiz = async (req, res) => {
   const { course, subject, topic, entryCoins, type, capacity } = req.body;
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
      type: type || "single",
      capacity,
   });

   const userId = req.user.userId;
   const participant = new Participant({
      quiz: quiz.id,
      user: userId,
      isCompleted: false,
   });

   const savedParticipant = await participant.save();
   const user = await User.findById(userId);
   user.quizParticipated++;
   user.balance -= entryCoins;
   user.walletLog.push(`-${entryCoins} for creating the quiz`);
   await user.save();
   quiz.noOfParticipants++;
   quiz.participants.push(savedParticipant);

   await quiz.populate("questions");

   await quiz.save();

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
   const type = req.query.type || "single";

   const quiz = await Quiz.find({ type });

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   res.status(200).json(quiz);
};

// update quiz (end quiz)
export const updateQuiz = async (req, res, next) => {
   const { id } = req.params;
   const endTime = Date.now();
   const quiz = await Quiz.findByIdAndUpdate(
      { _id: id },
      { endTime, isCompleted: true },
      { new: true }
   ).populate({
      path: "participants",
   });

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   const sortedParticipants = quiz.participants.sort((a, b) => {
      if (a.totalMarks === b.totalMarks) {
         return a.timeTaken - b.timeTaken;
      }
      return b.totalMarks - a.totalMarks;
   });

   const winner = sortedParticipants[0];

   const user = await User.findById(winner.user);

   const quizAmount = quiz.entryCoins;
   const walletAmount = 0.6 * quizAmount + quizAmount;

   user.balance += walletAmount;
   user.walletLog.push(`+${walletAmount} for winning the quiz`);
   await user.save();
   console.log(user);
   res.json({ winner });
};
