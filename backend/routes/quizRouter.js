const express = require('express');
const quizController = require('../controllers/quizController');
const { verifyUser, verifyAdmin } = require('../authenticate');

const quizRouter = express.Router();

// GET / submit: any logged-in user. POST / PUT / DELETE: Admin only.
quizRouter.route('/')
  .get(verifyUser, quizController.getAllQuizzes)
  .post(verifyUser, verifyAdmin, quizController.createQuiz)
  .put(verifyUser, verifyAdmin, quizController.notSupported)
  .delete(verifyUser, verifyAdmin, quizController.deleteAllQuizzes);

quizRouter.route('/:quizId')
  .get(verifyUser, quizController.getQuizById)
  .post(verifyUser, verifyAdmin, quizController.notSupported)
  .put(verifyUser, verifyAdmin, quizController.updateQuiz)
  .delete(verifyUser, verifyAdmin, quizController.deleteQuiz);

quizRouter.post('/:quizId/submit', verifyUser, quizController.submitQuiz);

module.exports = quizRouter;
