const Quiz = require('../models/quiz');
const Question = require('../models/question');

const notFound = (res, id) =>
  res.status(404).json({ message: `Quiz ${id} not found` });

// Every id in body.questions must be an existing question
const checkQuestions = async (ids) => {
  if (ids === undefined) return null;
  if (!Array.isArray(ids)) return 'questions must be an array of question IDs';
  const found = await Question.countDocuments({ _id: { $in: ids } });
  return found === new Set(ids.map(String)).size ? null : 'Some question IDs do not exist';
};

const cleanBody = ({ title, description, questions }) => {
  const body = {};
  if (title !== undefined) body.title = title;
  if (description !== undefined) body.description = description;
  if (questions !== undefined) body.questions = questions;
  return body;
};

// Normal users must not see the correct answers before they submit
const forUser = (quiz, user) => {
  const q = quiz.toObject();
  if (!user.admin) {
    q.questions = q.questions.map(({ correctAnswerIndex, ...rest }) => rest);
  }
  return q;
};

// GET /quizzes -> all quizzes, with full questions (populate)
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({}).populate('questions');
    res.status(200).json(quizzes.map((q) => forUser(q, req.user)));
  } catch (err) { next(err); }
};

// POST /quizzes  body: { title, description, questions: [questionId] }
exports.createQuiz = async (req, res, next) => {
  try {
    const problem = await checkQuestions(req.body.questions);
    if (problem) return res.status(400).json({ message: problem });
    const quiz = await Quiz.create(cleanBody(req.body));
    await quiz.populate('questions');
    res.status(201).json(quiz);
  } catch (err) { next(err); }
};

// DELETE /quizzes -> delete all quizzes (the questions stay in the bank)
exports.deleteAllQuizzes = async (req, res, next) => {
  try {
    const result = await Quiz.deleteMany({});
    res.status(200).json(result);
  } catch (err) { next(err); }
};

// GET /quizzes/:quizId
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return notFound(res, req.params.quizId);
    res.status(200).json(forUser(quiz, req.user));
  } catch (err) { next(err); }
};

// PUT /quizzes/:quizId
exports.updateQuiz = async (req, res, next) => {
  try {
    const problem = await checkQuestions(req.body.questions);
    if (problem) return res.status(400).json({ message: problem });
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $set: cleanBody(req.body) },
      { returnDocument: 'after', runValidators: true }
    ).populate('questions');
    if (!quiz) return notFound(res, req.params.quizId);
    res.status(200).json(quiz);
  } catch (err) { next(err); }
};

// DELETE /quizzes/:quizId -> delete the quiz only (its questions stay)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) return notFound(res, req.params.quizId);
    res.status(200).json(quiz);
  } catch (err) { next(err); }
};

// POST /quizzes/:quizId/submit  body: { answers: { [questionId]: selectedIndex } }
// Grades on the server so the correct answers never reach a normal user before submitting.
exports.submitQuiz = async (req, res, next) => {
  try {
    const answers = req.body.answers;
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an object { questionId: selectedIndex }' });
    }
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return notFound(res, req.params.quizId);

    const results = quiz.questions.map((q) => {
      const raw = answers[q._id.toString()];
      const selected = raw === undefined || raw === null ? null : Number(raw);
      return {
        questionId: q._id,
        text: q.text,
        options: q.options,
        selected,
        correctAnswerIndex: q.correctAnswerIndex,
        correct: selected === q.correctAnswerIndex
      };
    });
    const score = results.filter((r) => r.correct).length;
    res.status(200).json({ quizId: quiz._id, score, total: results.length, results });
  } catch (err) { next(err); }
};

exports.notSupported = (req, res) =>
  res.status(403).json({ message: `${req.method} operation not supported on ${req.originalUrl}` });
