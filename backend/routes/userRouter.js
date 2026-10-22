const express = require('express');
const userController = require('../controllers/userController');
const { verifyUser, verifyAdmin } = require('../authenticate');

const userRouter = express.Router();

userRouter.get('/', verifyUser, verifyAdmin, userController.getAllUsers);
userRouter.get('/me', verifyUser, userController.me);
userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);

module.exports = userRouter;
