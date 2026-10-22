require('dotenv').config({ quiet: true });
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
const userRouter = require('./routes/userRouter');
const quizRouter = require('./routes/quizRouter');
const questionRouter = require('./routes/questionRouter');

connectDB();

const app = express();

// CORS_ORIGIN: comma-separated list of frontend URLs allowed to call the API (empty = allow all)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(passport.initialize());

// Health check (Render pings this, and it is handy to wake the free instance up)
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Quiz API is running' }));

app.use('/users', userRouter);
app.use('/quizzes', quizRouter);
app.use('/questions', questionRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler: always JSON
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'CastError') { status = 400; message = `Invalid ID: ${err.value}`; }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
});

module.exports = app;
