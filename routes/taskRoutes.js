const express = require("express");
const router = express.Router();
const c = require("../controllers/taskController");

router.route("/").get(c.getTasks).post(c.createTask);
router.route("/:id").get(c.getTask).put(c.updateTask).delete(c.deleteTask);

module.exports = router;