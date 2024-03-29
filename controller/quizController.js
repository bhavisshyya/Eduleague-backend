import Quiz from "../models/quizModel.js";
import Question from "../models/questionModel.js";
import Participant from "../models/participantModel.js";
import User from "../models/userModel.js";
import axios from "axios";

export const createQuiz = async (req, res, next) => {
   const {
      course,
      subject,
      topic,
      entryCoins,
      type,
      capacity,
      questionnaireBy,
   } = req.body;
   const creator = req.user.userId;
   if (!course || !entryCoins) {
      return res
         .status(400)
         .json({ error: "Course and entryCoins are required parameters" });
   }

   if (type === "community" && !req.user.isAdmin)
      return next("only admins can create community quiz");

   if (type === "single" && capacity > 2)
      return next("single quiz can have max capacity of 2");

   const filter = { course };
   if (subject) filter.subject = subject;
   if (topic) filter.topic = topic;

   if (questionnaireBy) filter.questionnaireBy = questionnaireBy;
   else filter.questionnaireBy = "Eduleague";

   const questions = await Question.find(filter);

   if (questions.length === 0) {
      return res
         .status(404)
         .json({ error: "No questions available for the chosen filters" });
   }

   const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

   const selectedQuestions = shuffledQuestions.slice(0, 10);
   let duration = 0;

   selectedQuestions.forEach((item) => {
      duration += item.duration;
   });

   const quiz = new Quiz({
      creator,
      course,
      subject: subject || null,
      topic: topic || null,
      entryCoins,
      type: type || "single",
      capacity,
      duration,
   });
   selectedQuestions.map((q) => quiz.questions.push(q._id));
   const userId = req.user.userId;
   const user = await User.findById(userId);

   if (type === "single") {
      const participant = new Participant({
         quiz: quiz.id,
         user: userId,
         isCompleted: false,
      });
      const savedParticipant = await participant.save();
      quiz.participants.push(savedParticipant);
      quiz.noOfParticipants++;
      user.quizParticipated++;
   }
   user.balance -= entryCoins;
   const date = Date.now();
   user.walletLog.push(`-${entryCoins} for creating the quiz@${date}`);
   await user.save();

   const savedQuiz = await quiz.save();

   setTimeout(async () => {
      await axios.put(
         `https://eduleague-6le7o.ondigitalocean.app/api/v1/quiz/${savedQuiz._id}`
      );
   }, 24 * 60 * 60 * 1000);

   res.status(200).json({
      message: "Quiz created successfully",
      quiz,
      questions: selectedQuestions,
      duration,
   });
};

//  get single Quiz

export const getQuiz = async (req, res) => {
   const id = req.params.id;

   const quiz = await Quiz.findById(id)
      .populate({
         path: "participants",
         populate: {
            path: "user",
            model: "User",
         },
         options: {
            sort: {
               totalMarks: -1, // Sort by totalMarks in descending order
               timeTaken: 1, // Sort by timeTaken in ascending order
            },
         },
      })
      .populate("creator");

   const populateQuestions = await Question.find({
      _id: { $in: quiz.questions },
   });

   quiz.questions = populateQuestions;

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   const sortedParticipants = quiz.participants;
   const winner = sortedParticipants[0];

   res.status(200).json({ quiz, sortedParticipants, winner });
};

//  Get All Quizs

export const getAllQuizes = async (req, res) => {
   const { course, subject, topic, createdBy } = req.query;
   let filter = { isCompleted: false };
   if (course) filter.course = course;
   if (subject) filter.subject = subject;
   if (topic) filter.topic = topic;

   const userId = req.user.userId;
   let quizes = await Quiz.find(filter)
      .populate("creator")
      .sort({ startTime: -1 });

   if (createdBy) {
      const fName = createdBy.split(" ")[0];
      const lName = createdBy.split(" ")[1];
      quizes = quizes.filter((quiz) => {
         if (lName) {
            return quiz.creator.fName === fName && quiz.creator.lName === lName;
         } else {
            return quiz.creator.fName === fName;
         }
      });
   }

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
   console.log("hit");

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
      options: {
         sort: {
            totalMarks: -1, // Sort by totalMarks in descending order
            timeTaken: 1, // Sort by timeTaken in ascending order
         },
      },
   });

   if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
   }

   const sortedParticipants = quiz.participants;
   const winner = sortedParticipants[0];
   if (quiz.isCompleted === true) {
      return res.status(200).json({ quiz, winner, sortedParticipants });
   } else {
      quiz.isCompleted = true;
      await quiz.save();
      let user;
      if (winner) {
         user = await User.findById(winner.user);

         const quizAmount = quiz.entryCoins;
         const walletAmount = 0.6 * quizAmount + quizAmount;

         user.balance += walletAmount;
         user.walletLog.push(
            `+${walletAmount} for winning the quiz@${endTime}`
         );
         user.quizWon++;
         await user.save();
      }
      res.status(200).json({ winner, sortedParticipants, quiz });
   }
};

export const userAnalysis = async (req, res, next) => {
   const userId = req.user.userId;
   const quizzes = await Quiz.find({
      isCompleted: true,
   })
      .populate({
         path: "participants",
         populate: {
            path: "user",
            model: "User",
         },
      })
      .populate("creator")
      .sort({ totalMarks: -1, timeTaken: 1 });

   const filteredQuizzes = quizzes.filter((quiz) =>
      quiz.participants.some((p) => p.user._id.toString() === userId)
   );
   const winQuiz = [];
   const lossQuiz = [];

   filteredQuizzes.forEach((quiz) => {
      if (quiz.participants.length > 1) {
         if (quiz.participants[0].user._id.toString() === userId) {
            winQuiz.push(quiz);
         } else {
            lossQuiz.push(quiz);
         }
      }
   });

   winQuiz.reverse();
   lossQuiz.reverse();

   res.status(200).json({ winQuiz, lossQuiz });
};
