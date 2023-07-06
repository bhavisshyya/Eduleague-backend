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

   const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

   const selectedQuestions = shuffledQuestions.slice(0, 10);
   const quiz = new Quiz({
      creator,
      course,
      subject: subject || null,
      topic: topic || null,
      entryCoins,
      type: type || "single",
      capacity,
   });
   selectedQuestions.map((q) => quiz.questions.push(q._id));
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

   await quiz.save();

   res.status(200).json({
      message: "Quiz created successfully",
      quiz,
      questions: selectedQuestions,
   });
};

//  get single Quiz

export const getQuiz = async (req, res) => {
   const id = req.params.id;

   const quiz = await Quiz.findById(id)
      .populate("participants")
      .populate("creator");

   const populateQuestions = await Question.find({
      _id: { $in: quiz.questions },
   });

   quiz.questions = populateQuestions;

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   res.status(200).json(quiz);
};

//  Get All Quizs

export const getAllQuizes = async (req, res) => {
   // const type = req.query.type || "single";
   const userId = req.user.userId;
   const quizes = await Quiz.find({
      createdBy: { $ne: userId },
      isCompleted: false,
   }).sort({ startTime: -1 });

   if (quizes.length === 0) {
      return res.status(404).json({ error: "Quizzes not found" });
   }

   const singleQuizes = quizes.filter((quiz) => quiz.type === "single");
   const communityQuizes = quizes.filter((quiz) => quiz.type === "community");

   res.status(200).json({ singleQuizes, communityQuizes });
};

// update quiz (end quiz)
export const updateQuiz = async (req, res, next) => {
   const { id } = req.params;
   const endTime = Date.now();

   const quiz = await Quiz.findByIdAndUpdate(
      { _id: id },
      { endTime },
      { new: true }
   ).populate({
      path: "participants",
      populate: {
         path: "user",
         model: "User",
      },
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
   if (quiz.isCompleted === true) {
      res.status(200).json({ quiz, winner, sortedParticipants });
   }

   quiz.isCompleted = true;
   await quiz.save();

   const user = await User.findById(winner.user);

   const quizAmount = quiz.entryCoins;
   const walletAmount = 0.6 * quizAmount + quizAmount;

   user.balance += walletAmount;
   user.walletLog.push(`+${walletAmount} for winning the quiz`);
   user.quizWon++;
   await user.save();
   res.status(200).json({ winner, sortedParticipants, quiz });
};
