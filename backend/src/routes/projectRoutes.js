const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  deleteProject,
  inviteMember,
  getMyInvites,
  acceptInvite,
  declineInvite,
  getProjectInvites,
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/invites/me", authMiddleware, getMyInvites);

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.delete("/:projectId", authMiddleware, deleteProject);
router.post("/:projectId/invite", authMiddleware, inviteMember);
router.get("/:projectId/invites", authMiddleware, getProjectInvites);
router.post("/:projectId/invites/accept", authMiddleware, acceptInvite);
router.post("/:projectId/invites/decline", authMiddleware, declineInvite);

module.exports = router;