const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/tasks", taskRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

module.exports = app;