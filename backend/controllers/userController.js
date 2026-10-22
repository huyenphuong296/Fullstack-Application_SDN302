const passport = require('passport');
const User = require('../models/user');
const authenticate = require('../authenticate');

const publicUser = (user) => ({ _id: user._id, username: user.username, admin: user.admin });

// GET /users -> Admin only: all registered users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username admin');
    res.status(200).json(users);
  } catch (err) { next(err); }
};

// GET /users/me -> the logged-in user (used by the frontend to restore a session)
exports.me = (req, res) => res.status(200).json(publicUser(req.user));

// POST /users/signup  body: { username, password }
// Every new account is a normal user; admins are created by the seed script.
exports.signup = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password.length < 3) {
      return res.status(400).json({ message: 'Password must be at least 3 characters' });
    }
    // register() hashes the password and saves the user
    const user = await User.register(new User({ username, admin: false }), password);
    res.status(201).json({ success: true, status: 'Registration Successful!', user: publicUser(user) });
  } catch (err) {
    if (err.name === 'UserExistsError') {
      return res.status(409).json({ message: 'That username is already taken' });
    }
    next(err);
  }
};

// POST /users/login  body: { username, password } -> returns a JWT and the user
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password' });
    }
    const token = authenticate.getToken({ _id: user._id });
    res.status(200).json({
      success: true,
      status: 'You are successfully logged in!',
      token,
      user: publicUser(user)
    });
  })(req, res, next);
};
