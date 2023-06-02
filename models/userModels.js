const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please Provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a Valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please Provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on SAVE & CREATE
      // Atle aapde Jyare PassWord First Time Create & Save Karsu Tyare aa validation kaam aavse
      //  Update password ma aa validation work nai kare
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password Are not Same'
    }
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually changed
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
