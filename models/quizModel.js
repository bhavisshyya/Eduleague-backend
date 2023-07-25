import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
   creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   course: {
      type: String,
      required: true,
   },
   subject: {
      type: String,
   },
   noOfParticipants: {
      type: Number,
      default: 0,
   },
   topic: {
      type: String,
   },
   type: {
      type: String,
   },
   questions: [
      {
         type: String,
         ref: "Question",
         required: true,
      },
   ],
   participants: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Participant",
      },
   ],
   capacity: {
      type: Number,
      default: 2,
   },
   startTime: {
      type: Date,
      default: Date.now,
   },
   duration: {
      type: Number,
      default: 300,
   },
   endTime: {
      type: Date,
   },
   entryCoins: {
      type: Number,
   },
   isCompleted: {
      type: Boolean,
      default: false,
   },
});
quizSchema.pre("save", function (next) {
   this.endTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000);
   next();
});

export default mongoose.model("Quiz", quizSchema);
