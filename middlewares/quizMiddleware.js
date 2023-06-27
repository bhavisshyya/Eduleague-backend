import Quiz from "../models/quizModel.js";

export const checkParticipant = async (req, res, next) => {
   const id = req.params.id;
   const quiz = await Quiz.findById(id).populate("participants");
   const participants = quiz.participants;

   for (let i = 0; i < participants.length; i++) {
      if (participants[i].user == req.user.userId) {
         return next("You have already participated in this quiz");
      }
   }

   next();
};
