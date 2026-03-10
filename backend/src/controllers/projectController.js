const Project = require("../models/Project");
const User = require("../models/user");
const { Resend } = require("resend");


exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });
    const project = await Project.create({ name, owner: req.user._id, members: [req.user._id] });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate("owner", "name email");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can delete this project" });

    await Task.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can invite members" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with that email" });
    if (project.members.includes(user._id))
      return res.status(400).json({ message: "User is already a member" });

    const alreadyInvited = project.pendingInvites.some(
      (inv) => inv.user.toString() === user._id.toString()
    );
    if (alreadyInvited) return res.status(400).json({ message: "User already has a pending invite" });

    project.pendingInvites.push({ user: user._id, invitedBy: req.user._id });
    await project.save();

    // Send email notification
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "DevFlow <onboarding@resend.dev>",
        to: user.email,
        subject: `You've been invited to join ${project.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f1117; color: #e2e8f0; border-radius: 12px;">
            <div style="font-size: 22px; font-weight: 800; color: #4f6ef7; margin-bottom: 24px;">DevFlow</div>
            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #f1f5f9;">
              You've been invited to a project
            </h2>
            <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
              Hi <strong style="color: #f1f5f9;">${user.name}</strong>,<br/>
              <strong style="color: #f1f5f9;">${req.user.name}</strong> has invited you to join
              <strong style="color: #f1f5f9;">${project.name}</strong> on DevFlow.
            </p>
            <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
              Log in to your account and check your <strong style="color: #f1f5f9;">Invitations</strong> page to accept or decline.
            </p>
            <div style="font-size: 12px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px;">
              If you weren't expecting this, you can safely ignore this email.
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError.message);
    }

    res.status(200).json({ message: `Invite sent to ${user.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyInvites = async (req, res) => {
  try {
    const projects = await Project.find({ "pendingInvites.user": req.user._id })
      .populate("owner", "name email")
      .populate("pendingInvites.invitedBy", "name email");

    const invites = projects.map((project) => {
      const invite = project.pendingInvites.find(
        (inv) => inv.user.toString() === req.user._id.toString()
      );
      return {
        projectId: project._id,
        projectName: project.name,
        invitedBy: invite.invitedBy,
        invitedAt: invite.invitedAt,
        owner: project.owner,
      };
    });

    res.status(200).json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept an invite
exports.acceptInvite = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const inviteIndex = project.pendingInvites.findIndex(
      (inv) => inv.user.toString() === req.user._id.toString()
    );
    if (inviteIndex === -1) return res.status(404).json({ message: "No pending invite found" });

    project.pendingInvites.splice(inviteIndex, 1);
    project.members.push(req.user._id);
    await project.save();

    res.status(200).json({ message: "You have joined the project!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline an invite
exports.declineInvite = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const inviteIndex = project.pendingInvites.findIndex(
      (inv) => inv.user.toString() === req.user._id.toString()
    );
    if (inviteIndex === -1) return res.status(404).json({ message: "No pending invite found" });

    project.pendingInvites.splice(inviteIndex, 1);
    await project.save();

    res.status(200).json({ message: "Invite declined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending invites for a specific project (owner view)
exports.getProjectInvites = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate("pendingInvites.user", "name email")
      .populate("pendingInvites.invitedBy", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    res.status(200).json(project.pendingInvites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};