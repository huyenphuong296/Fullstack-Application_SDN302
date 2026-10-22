const express = require('express');
const questionController = require('../controllers/questionController');
const { verifyUser, verifyAdmin } = require('../authenticate');

const questionRouter = express.Router();

// GET: any logged-in user (answers hidden for non-admins). POST / PUT / DELETE: Admin only.
questionRouter.route('/')
  .get(verifyUser, questionController.getAllQuestions)
  .post(verifyUser, verifyAdmin, questionController.createQuestion)
  .put(verifyUser, verifyAdmin, questionController.notSupported)
  .delete(verifyUser, verifyAdmin, questionController.deleteAllQuestions);

questionRouter.route('/:questionId')
  .get(verifyUser, questionController.getQuestionById)
  .post(verifyUser, verifyAdmin, questionController.notSupported)
  .put(verifyUser, verifyAdmin, questionController.updateQuestion)
  .delete(verifyUser, verifyAdmin, questionController.deleteQuestion);

module.exports = questionRouter;
