const express = require('express');
const multer = require('multer'); // loading multer for file upload
const sharp = require('sharp'); // formatting images
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const router = new express.Router();

// route to create users
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// sign in route
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredientials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// sign out route
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// sign out from all sessions routes
router.post('/users/logoutAll', auth, async(req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
})

// route to read multiple users
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// route to read one user
router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

// route to update one user
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body); // keys to update sent by user
  const allowedUpdates = ['name', 'email', 'password', 'age']; // allowed keys to update
  const isValidOperation = updates.every(update => allowedUpdates.includes(update)); // check if invalid key was sent
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' }); // return 400 if an invalid key was sent
  }
  try {
    // new: true to return the updated user not the one found originally
    // runValidators to run validations on update
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    if (!req.user) {
      return res.status(404).send();
    }
    res.send(req.user);
  } catch (error) {
    res.status(400).send(); // validations didn't pass
  }
});

// route to delete a user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000, // in bytes so 1 million is 1MB
  },
  fileFilter(req, file, callback) {
    // callback(new Error('file must be a JPG')); // something went wrong
    // callback(undefined, true) // nothing went wrong
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Please upload an image'));
    }
    callback(undefined, true);
  }
});

// upload new profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
});

// fetch avatar
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
