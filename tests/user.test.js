const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setUpDatabase } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('Should sign up a new user', async () => {
  const response = await request(app).post('/users')
                    .send({
                      name: "Lucien",
                      email: "lucien@gmail.com",
                      password: "Lg_260571775"
                    })
                    .expect(201);
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: 'Lucien',
      email: 'lucien@gmail.com'
    },
    token: user.tokens[0].token
  });
  expect(user.password).not.toBe('Lg_260571775'); // password should be encoded
});

test('Should log in an existing user', async () => {
  const response = await request(app).post('/users/login')
                    .send({
                      email: userOne.email,
                      password: userOne.password
                    })
                    .expect(200);
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non-existent user", async () => {
  await request(app).post('/users/login')
                    .send({
                      email: userOne.email,
                      password: 'wrongpassword123!'
                    })
                    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app).get('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send()
                    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me')
                    .send()
                    .expect(401);
});

test('Should delete a user that is authenticated', async () => {
  const response = await request(app).delete('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send()
                    .expect(200);
  const user = await User.findById(userOne.id);
  expect(user).toBeNull();
});

test('Should not delete an unauthenticated user', async () => {
  await request(app).delete('/users/me')
                    .send()
                    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app).post('/users/me/avatar')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
                    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app).patch('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                      name: "Lucien",
                      age: 24
                    })
                    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.name).toEqual('Lucien');
  expect(user.age).toEqual(24);
});

test('Should not update invalid user fields', async () => {
  await request(app).patch('/users/me')
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .send({
                      location: 'London uk'
                    })
                    .expect(400);
});
