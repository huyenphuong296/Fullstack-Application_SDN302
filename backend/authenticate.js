const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const User = require('./models/user');

const secretKey = process.env.SECRET_KEY;

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Local strategy: checks username + password on POST /users/login
passport.use(new LocalStrategy(User.authenticate()));

exports.getToken = (user) =>
  jwt.sign(user, secretKey, { expiresIn: '1d' });

// JWT strategy: reads "Authorization: Bearer <token>" and loads the user
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload._id);
      return user ? done(null, user) : done(null, false);
    } catch (err) { return done(err, false); }
  }
));

// Valid token -> req.user is the logged-in user, otherwise 401
exports.verifyUser = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(httpError(401, 'You are not logged in or your token is invalid/expired!'));
    req.user = user;
    next();
  })(req, res, next);
};

// Must come after verifyUser
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin) return next();
  return next(httpError(403, 'You are not authorized to perform this operation!'));
};
