const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'John',
  email: 'john@test.com',
  password: 'John123456!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Mike',
  email: 'mike@test.com',
  password: 'Mike123456!',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
  }]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'This is my first task in tests',
  completed: false,
  user: userOneId
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'This is my second task in tests',
  completed: true,
  user: userOneId
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'This is my third task in tests',
  completed: true,
  user: userTwoId
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase
};
