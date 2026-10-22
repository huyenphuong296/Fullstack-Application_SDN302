const Question = require('../models/question');
const Quiz = require('../models/quiz');

const notFound = (res, id) =>
  res.status(404).json({ message: `Question ${id} not found` });

// Normal users must not see the correct answer before they submit
const forUser = (question, user) => {
  const q = question.toObject();
  if (!user.admin) delete q.correctAnswerIndex;
  return q;
};

// Trim the options and drop empty ones before saving
const cleanBody = ({ text, options, correctAnswerIndex, keywords }) => {
  const body = {};
  if (text !== undefined) body.text = text;
  if (options !== undefined) {
    body.options = Array.isArray(options) ? options.map((o) => String(o).trim()).filter(Boolean) : options;
  }
  if (correctAnswerIndex !== undefined) body.correctAnswerIndex = Number(correctAnswerIndex);
  if (keywords !== undefined) body.keywords = keywords;
  return body;
};

// GET /questions
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({}).sort({ _id: -1 });
    res.status(200).json(questions.map((q) => forUser(q, req.user)));
  } catch (err) { next(err); }
};

// POST /questions  body: { text, options, correctAnswerIndex, quizId? }
// If quizId is given, the new question is also added to that quiz.
exports.createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    let quiz = null;
    if (quizId) {
      quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(400).json({ message: `Quiz ${quizId} not found` });
    }
    const question = await Question.create({ ...cleanBody(req.body), author: req.user._id });
    if (quiz) {
      quiz.questions.push(question._id);
      await quiz.save();
    }
    res.status(201).json(question);
  } catch (err) { next(err); }
};

// DELETE /questions -> delete every question and remove them from every quiz
exports.deleteAllQuestions = async (req, res, next) => {
  try {
    const result = await Question.deleteMany({});
    await Quiz.updateMany({}, { $set: { questions: [] } });
    res.status(200).json(result);
  } catch (err) { next(err); }
};

// GET /questions/:questionId
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return notFound(res, req.params.questionId);
    res.status(200).json(forUser(question, req.user));
  } catch (err) { next(err); }
};

// PUT /questions/:questionId
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return notFound(res, req.params.questionId);
    question.set(cleanBody(req.body));
    await question.save(); // save() runs every validator, e.g. correctAnswerIndex vs options
    res.status(200).json(question);
  } catch (err) { next(err); }
};

// DELETE /questions/:questionId -> also removes it from every quiz
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    if (!question) return notFound(res, req.params.questionId);
    await Quiz.updateMany({ questions: question._id }, { $pull: { questions: question._id } });
    res.status(200).json(question);
  } catch (err) { next(err); }
};

exports.notSupported = (req, res) =>
  res.status(403).json({ message: `${req.method} operation not supported on ${req.originalUrl}` });
