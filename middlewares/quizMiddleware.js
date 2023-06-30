import Quiz from "../models/quizModel.js";

export const checkParticipant = async (req, res, next) => {
   const id = req.params.id;
   const quiz = await Quiz.findById(id).populate("participants");
   const participants = quiz.participants;

   const maxCapacity = quiz.capacity;
   if (participants.length >= maxCapacity) {
      return next("Quiz has reached its maximum capacity");
   }

   for (let i = 0; i < participants.length; i++) {
      if (participants[i].user == req.user.userId) {
         return next("You have already participated in this quiz");
      }
   }

   next();
};

// here

export const checkCreator = async (req, res, next) => {
   const id = req.params.id;
   const quiz = await Quiz.findById(id);
   if (quiz.creator != req.user.userId)
      return next("only creator can end the quiz");

   return next();
};
