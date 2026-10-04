const express = require("express");
const router = express.Router();

const c = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

// Protect all task routes
router.use(protect);

// Task routes
router.get("/", c.getTasks);
router.post("/", c.createTask);
router.get("/:id", c.getTask);
router.put("/:id", c.updateTask);
router.delete("/:id", c.deleteTask);

module.exports = router;