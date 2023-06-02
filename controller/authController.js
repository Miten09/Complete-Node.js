const jwt = require('jsonwebtoken');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //same as email=req.body.email, & password=req.body.password

  //1) Check if email & password exist
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password', 400));
  }

  //2) Check if user exits & password is correct

  const user = await User.findOne({ email }).select('+password');
  console.log(user);

  const token = '';
  res.status(200).json({
    status: 'success',
    token
  });
});
