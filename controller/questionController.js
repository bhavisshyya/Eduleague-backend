import Question from "../models/questionModel.js";

export const createQuestion = async (req, res, next) => {
   const question = new Question({
      ...req.body,
   });

   const newQuestion = await question.save();
   res.status(201).json({
      success: true,
      newQuestion,
   });
};

export const selectQuestions = async (req, res, next) => {
   const filterObject = {};
   const { subject, course, topic } = req.query;

   if (subject && subject != "all") filterObject.subject = subject;

   if (course && course != "all") filterObject.course = course;

   if (topic && topic != "all") filterObject.topic = topic;

   const limit = req.query.limit || 10;

   const questions = await Question.find(filterObject).limit(limit);

   res.status(200).json({
      success: true,
      totalQuestions: questions.length,
      questions,
   });
};
