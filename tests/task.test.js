const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOneId, userOne, userTwo, userTwoId, taskOne, taskTwo, taskThree, setUpDatabase } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('Should create task for user', async () => {
  const response = await request(app).post('/tasks')
                                     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                                     .send({
                                      description: 'This is my first task created in tests'
                                     })
                                     .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should get all the tasks for an authenticated user', async() => {
  const response = await request(app).get('/tasks')
                                     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                                     .expect(200);
  const tasks = response.body;
  expect(tasks.length).toEqual(2);
});

test('Should not delete a task that does not belong to the authenticated user', async () => {
  const response = await request(app).delete(`/tasks/${taskOne._id}`)
                    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                    .send()
                    .expect(404);
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
