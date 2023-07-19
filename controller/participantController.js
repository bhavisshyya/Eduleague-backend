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
   const date = Date.now();
   user.walletLog.push(`-${quiz.entryCoins} for joining the quiz@${date}`);
   await user.save();

   res.status(201).json({ success: true, savedParticipant });
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
   const quiz = await Quiz.findById(quizId);
   if (
      quiz.type === "single" &&
      quiz.noOfParticipants === 2 &&
      !quiz.isCompleted
   ) {
      const endTime = Date.now();
      quiz.endTime = endTime;
      quiz.isCompleted = true;
      await quiz.populate({
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
      const winner = quiz.participants[0];
      const user = await User.findById(winner.user);

      const quizAmount = quiz.entryCoins;
      const walletAmount = 0.6 * quizAmount + quizAmount;
      user.balance += walletAmount;

      user.walletLog.push(`+${walletAmount} for winning the quiz@${endTime}`);

      user.quizWon++;
      console.log(quizAmount);
      await user.save();
      await quiz.save();
   }

   await participant.populate("quiz");
   res.status(200).json(participant);
};
