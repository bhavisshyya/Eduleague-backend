import Participant from "../models/participantModel.js";
import Quiz from "../models/quizModel.js";
import User from "../models/userModel.js";
export const createParticipant = async (req, res) => {
       const { id } = req.params;
       const userId = req.user.userId;
        console.log(userId);
       const participant = new Participant({
          quiz: id,
          user: userId,
          isCompleted: false,
       });
       
       const savedParticipant = await participant.save();
       
       const user = await User.findById(userId);
       user.quizParticipated++;
       await user.save();

       const quiz = await Quiz.findByIdAndUpdate(
          id,
          { $push: { participants: savedParticipant._id } },
          { new: true }
       );
 
       res.status(201).json(savedParticipant);
 };
 