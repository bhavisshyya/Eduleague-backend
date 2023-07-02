import Participant from "../models/participantModel.js";
import Quiz from "../models/quizModel.js";
import User from "../models/userModel.js";

export const joinQuiz = async (req, res) => {
   const { id } = req.params;
   const userId = req.user.userId;
   const participant = new Participant({
      quiz: id,
      user: userId,
      isCompleted: false,
   });

   const savedParticipant = await participant.save();
   const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $push: { participants: savedParticipant._id } },
      { new: true }
   );
   quiz.noOfParticipants++;
   await quiz.save();

   const user = await User.findById(userId);
   user.quizParticipated++;
   user.balance -= quiz.entryCoins;
   user.walletLog.push(`-${quiz.entryCoins} for joining the quiz`);
   await user.save();

   res.status(201).json(savedParticipant);
};

export const getParticipant = async (req, res, next) => {
   const { id } = req.params;

   const participant = await Participant.findOne({
      _id: id,
      isCompleted: true,
   })
      .populate({
         path: "quiz",
         populate: {
            path: "participants",
            match: { isCompleted: true },
            populate: { path: "user", model: "User" },
         },
      })
      .populate("user");

   if (!participant) {
      return next("Participant not found or is not completed");
   }

   res.status(200).json(participant);
};

export const updateParticipant = async (req, res, next) => {
   const { id } = req.params;
   const {
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      totalAttempted,
      totalMarks,
      timeTaken,
   } = req.body;

   const participant = await Participant.findByIdAndUpdate(
      id,
      {
         correctAnswers,
         incorrectAnswers,
         skippedQuestions,
         totalAttempted,
         totalMarks,
         timeTaken,
         isCompleted: true,
      },
      { new: true }
   );

   if (!participant) {
      return next("Participant not found ");
   }

   const quizId = participant.quiz;
   await Quiz.findById(quizId);
   await participant.populate("quiz");

   res.status(200).json(participant);
};
