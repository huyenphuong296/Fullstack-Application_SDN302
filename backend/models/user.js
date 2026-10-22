const mongoose = require('mongoose');
// v9 is compiled to CommonJS with a default export -> take .default
const passportLocalMongoose = require('passport-local-mongoose').default;
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // passport-local-mongoose also defines username and adds hash + salt for the password
  username: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
