const express = require("express");
const router = express.Router();

const { 
    createTask, 
    updateTaskStatus, 
    getTasksByProject, 
    deleteTask, 
    createPersonalTask, 
    getPersonalTasks
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTask);
router.patch("/:taskId", authMiddleware, updateTaskStatus);
router.get("/", authMiddleware, getTasksByProject);
router.delete("/:taskId", authMiddleware, deleteTask);
router.post("/personal", authMiddleware, createPersonalTask);
router.get("/personal", authMiddleware, getPersonalTasks);

module.exports = router;
