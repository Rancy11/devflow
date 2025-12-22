const Project = require("../models/Project");
const User = require("../models/user");

exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name required" });
    }

    const project = await Project.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async(req,res)=>{
    try{
        const projects = await Project.find({
            members: req.user._id,
        }).populate("owner", "name email");
        res.status(200).json(projects);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};


exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can add members" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User already a member" });
    }

    project.members.push(user._id);
    await project.save();

    res.status(200).json({
      message: "Member added successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
