const mongoose = require("mongoose");
const Task = require("../models/taskmodels");

// Only these fields can be supplied by the client. Ownership is server-controlled.
const getTaskFields = (body = {}) => {
  const fields = {};
  for (const key of ["title", "description", "status", "priority", "dueDate"]) {
    if (Object.prototype.hasOwnProperty.call(body, key)) fields[key] = body[key];
  }
  return fields;
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...getTaskFields(req.body),
      user: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    err.status = err.name === "ValidationError" ? 400 : 500;
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const updates = getTaskFields(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Provide at least one editable task field" });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    err.status = err.name === "ValidationError" ? 400 : 500;
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};
