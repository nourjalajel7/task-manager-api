const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/usermodels");
const Task = require("../models/taskmodels");
const app = require("../app");

// Exercise real HTTP routes and JWT middleware with an isolated in-memory model stub.
// No .env file is loaded and no MongoDB data is read or written.
test("authentication and two-user task isolation", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "local-test-secret-only";
  const users = [];
  const tasks = [];
  const original = { createUser: User.create, findUser: User.findOne,
    findUserId: User.findById, createTask: Task.create, findTasks: Task.find,
    findTask: Task.findOne, updateTask: Task.findOneAndUpdate,
    deleteTask: Task.findOneAndDelete };
  const matches = (task, filter) => Object.entries(filter)
    .every(([key, value]) => String(task[key]) === String(value));
  User.create = async (body) => {
    const user = new User(body);
    await user.validate();
    user.password = await bcrypt.hash(body.password, 4);
    users.push(user);
    return user;
  };
  User.findOne = async ({ email }) => users.find((user) => user.email === email);
  User.findById = (id) => ({ select: async () => {
    const user = users.find((item) => String(item._id) === id);
    return user && { _id: user._id, name: user.name, email: user.email };
  } });
  Task.create = async (body) => {
    const task = new Task(body);
    await task.validate();
    tasks.push(task);
    return task;
  };
  Task.find = (filter) => ({ sort: async () => tasks.filter((task) => matches(task, filter)) });
  Task.findOne = async (filter) => tasks.find((task) => matches(task, filter));
  Task.findOneAndUpdate = async (filter, update) => {
    const task = tasks.find((item) => matches(item, filter));
    if (!task) return null;
    const candidate = new Task({ ...task.toObject(), ...update.$set });
    await candidate.validate();
    Object.assign(task, update.$set);
    return task;
  };
  Task.findOneAndDelete = async (filter) => {
    const index = tasks.findIndex((task) => matches(task, filter));
    return index < 0 ? null : tasks.splice(index, 1)[0];
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    User.create = original.createUser;
    User.findOne = original.findUser;
    User.findById = original.findUserId;
    Task.create = original.createTask;
    Task.find = original.findTasks;
    Task.findOne = original.findTask;
    Task.findOneAndUpdate = original.updateTask;
    Task.findOneAndDelete = original.deleteTask;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  });
  const request = async (method, path, token, body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
      method, headers: { "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json() };
  };
  const tokens = [];
  for (const number of [1, 2]) {
    const registration = await request("POST", "/auth/register", null,
      { name: `User ${number}`, email: `USER${number}@example.com`, password: "test-pass-123" });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.user.password, undefined);
    const login = await request("POST", "/auth/login", null,
      { email: ` User${number}@example.com `, password: "test-pass-123" });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.password, undefined);
    tokens.push(login.body.token);
  }
  assert.equal((await request("POST", "/auth/login", null,
    { email: { $ne: null }, password: "test-pass-123" })).status, 400);
  assert.equal((await request("POST", "/auth/register", null,
    { name: "Short", email: "short@example.com", password: "123" })).status, 400);
  assert.equal((await request("POST", "/auth/login", null,
    { email: "user1@example.com", password: "wrong-password" })).status, 401);
  for (const token of [undefined, "invalid", jwt.sign({ id: String(users[0]._id) },
    process.env.JWT_SECRET, { expiresIn: -1 }), jwt.sign({ id: "bad-id" }, process.env.JWT_SECRET)]) {
    assert.equal((await request("GET", "/tasks", token)).status, 401);
  }
  const created = await request("POST", "/tasks", tokens[0],
    { title: "Private task", user: String(users[1]._id) });
  assert.equal(created.status, 201);
  assert.equal(created.body.user, String(users[0]._id));
  const path = `/tasks/${created.body._id}`;
  assert.equal((await request("GET", "/tasks", tokens[0])).body.length, 1);
  assert.equal((await request("GET", path, tokens[0])).status, 200);
  for (const method of ["GET", "PUT", "DELETE"]) {
    assert.equal((await request(method, path, tokens[1],
      method === "PUT" ? { title: "Stolen" } : undefined)).status, 404);
  }
  assert.deepEqual((await request("GET", "/tasks", tokens[1])).body, []);
  const updated = await request("PUT", path, tokens[0], { title: "Updated",
    user: String(users[1]._id), $set: { user: String(users[1]._id) } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, "Updated");
  assert.equal(updated.body.user, String(users[0]._id));
  assert.equal((await request("PUT", path, tokens[0], { user: String(users[1]._id) })).status, 400);
  assert.equal((await request("PUT", path, tokens[0], { status: "Invalid" })).status, 400);
  assert.equal((await request("POST", "/tasks", tokens[0], {})).status, 400);
  assert.equal((await request("GET", "/tasks/bad-id", tokens[0])).status, 400);
  assert.equal((await request("DELETE", path, tokens[0])).status, 200);
  assert.equal((await request("GET", path, tokens[0])).status, 404);
});
