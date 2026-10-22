const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  // Set by the server from req.user, never from the request body
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  options: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length >= 2,
      message: 'A question needs at least 2 options'
    }
  },
  keywords: {
    type: [String],
    default: []
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      // The index must point to an existing option
      validator: function (v) {
        return !this.options || v < this.options.length;
      },
      message: 'correctAnswerIndex must be smaller than the number of options'
    }
  }
});

module.exports = mongoose.model('Question', questionSchema);
