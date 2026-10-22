const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Only question IDs are stored here; populate('questions') returns the full questions
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }]
});

module.exports = mongoose.model('Quiz', quizSchema);
