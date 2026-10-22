// Creates the demo accounts and sample questions/quiz.
// Usage: npm run seed            -> only adds what is missing
//        npm run seed -- --reset -> wipes questions + quizzes first
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const User = require('../models/user');
const Question = require('../models/question');
const Quiz = require('../models/quiz');

const USERS = [
  { username: 'Mary', password: '123', admin: true },
  { username: 'John', password: '123', admin: false }
];

const QUESTIONS = [
  { text: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correctAnswerIndex: 0 },
  { text: 'What is the capital of England?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correctAnswerIndex: 1 },
  { text: 'What is the capital of Germany?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correctAnswerIndex: 2 },
  { text: 'What is the symbol for iron on the periodic table?', options: ['Fe', 'I', 'Au', 'Ag'], correctAnswerIndex: 0 },
  { text: 'Who developed the theory of relativity?', options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'], correctAnswerIndex: 0 }
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to', mongoose.connection.name);

  let admin;
  for (const u of USERS) {
    let user = await User.findOne({ username: u.username });
    if (!user) {
      user = await User.register(new User({ username: u.username, admin: u.admin }), u.password);
      console.log(`Created ${u.admin ? 'admin' : 'user'} ${u.username} / ${u.password}`);
    } else if (user.admin !== u.admin) {
      user.admin = u.admin;
      await user.save();
      console.log(`Updated ${u.username}: admin=${u.admin}`);
    } else {
      console.log(`${u.username} already exists`);
    }
    if (u.admin) admin = user;
  }

  if (process.argv.includes('--reset')) {
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    console.log('Removed all questions and quizzes');
  }

  if (await Quiz.countDocuments() === 0) {
    const questions = await Question.insertMany(QUESTIONS.map((q) => ({ ...q, author: admin._id })));
    await Quiz.create({
      title: 'General Knowledge',
      description: 'Capitals, science and history',
      questions: questions.map((q) => q._id)
    });
    console.log(`Created quiz "General Knowledge" with ${questions.length} questions`);
  } else {
    console.log('Quizzes already exist, skipped sample data');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
