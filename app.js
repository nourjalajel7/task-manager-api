// const express = require("express");
// const cors = require("cors");
// const taskRoutes = require("./routes/taskRoutes");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
// app.use("/tasks", taskRoutes);

// app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ message: err.message || "Server error" });
// });

// module.exports = app;

//-----------------------------------------------------------------


const express = require("express");
const cors = require("cors");

// Routes
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();


// ==============================
// Middleware
// ==============================

app.use(cors());
app.use(express.json());


// ==============================
// Health Check
// ==============================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Task Manager API is running",
  });
});


// ==============================
// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ==============================
// 404 - Route Not Found
// ==============================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {
  const status = err.status || 500;
  // Avoid exposing database details, credentials, or raw request values.
  if (status >= 500) console.error("Request failed:", err.name);
  res.status(status).json({
    message: status >= 500 ? "Server error" : err.message || "Request failed",
  });
});


module.exports = app;
