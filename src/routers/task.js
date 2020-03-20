const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// route to create tasks
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    user: req.user._id
  })
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send()
  }
});

// route to read multiple tasks
// limit and skip for pagination
// GET tasks?limit=10&skip=10
// GET tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'asc' ? 1 : -1 ;
    }
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send();
  }
});

// route to read one task
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({ _id, user: req.user._id })
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// route to update a task
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, user: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach(update => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

// route to delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, user: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
