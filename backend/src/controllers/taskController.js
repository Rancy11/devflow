const Task = require("../models/Task");
const Project = require("../models/Project");

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and Project ID are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["TODO", "IN_PROGRESS", "DONE"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "projectId required" });
    }

    const tasks = await Task.find({ project: projectId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // FIX: personal tasks have no project — skip the owner check safely
    let isProjectOwner = false;
    if (task.project) {
      const project = await Project.findById(task.project);
      isProjectOwner = project?.owner.toString() === req.user._id.toString();
    }

    const isTaskCreator = task.createdBy?.toString() === req.user._id.toString();

    if (!isProjectOwner && !isTaskCreator) {
      return res.status(403).json({ message: "You don't have permission to delete this task" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    // FIX: was "re.status" — typo that caused a second crash in the catch block
    res.status(500).json({ message: error.message });
  }
};

exports.createPersonalTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPersonalTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: null,
      createdBy: req.user._id,
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};