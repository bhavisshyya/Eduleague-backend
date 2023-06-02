import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
   quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
   },
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   isCompleted: {
      type: Boolean,
      default: false,
   },
   correctAnswers: {
      type: Number,
      default: 0,
   },
   incorrectAnswers: {
      type: Number,
      default: 0,
   },
   skippedQuestions: {
      type: Number,
      default: 0,
   },
   totalAttempted: {
      type: Number,
      default: 0,
   },
   totalMarks: {
      type: Number,
      default: 0,
   },
   timeTaken: {
      type: Number,
      default: 0,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

export default mongoose.model("Participant", participantSchema);
