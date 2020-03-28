// loading express
const express = require('express');

// loading mongoose
require ('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

app.use(express.json()); // parse automatically incoming JSON into an object
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
