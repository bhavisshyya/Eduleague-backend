import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
   _id: {
      type: String,
   },
   course: {
      type: String,
      required: true,
   },
   subject: {
      type: String,
      required: true,
   },
   topic: {
      type: String,
      required: true,
   },
   question: {
      type: String,
      required: true,
   },
   options: {
      type: [String],
      required: true,
   },
   correctAnswer: {
      type: String,
      required: true,
   },
   questionnaireBy: {
      type: String,
      default: "Eduleague",
   },
   duration: {
      type: Number,
      default: 30,
   },
});

export default mongoose.model("Question", questionSchema);
