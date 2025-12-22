const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

app.use("/auth", authRoutes);
const authMiddleware = require("./middleware/authMiddleware");

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});


app.get("/", (req, res) => {
  res.send("DevFlow API running");
});

module.exports = app;
