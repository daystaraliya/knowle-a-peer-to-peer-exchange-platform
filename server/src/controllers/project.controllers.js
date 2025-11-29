import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Exchange } from "../models/exchange.models.js";
import mongoose from "mongoose";

const createProject = asyncHandler(async (req, res) => {
    const { exchangeId } = req.body;
    const userId = req.user._id;

    if (!exchangeId || !mongoose.Types.ObjectId.isValid(exchangeId)) {
        throw new ApiError(400, "A valid Exchange ID is required to create a project.");
    }

    const exchange = await Exchange.findById(exchangeId)
        .populate('topicToLearn', 'name')
        .populate('topicToTeach', 'name')
        .populate('initiator', 'fullName')
        .populate('receiver', 'fullName');
        
    if (!exchange) {
        throw new ApiError(404, "Exchange not found.");
    }

    if (exchange.project) {
        throw new ApiError(409, "A project for this exchange already exists.");
    }

    if (!exchange.initiator._id.equals(userId) && !exchange.receiver._id.equals(userId)) {
        throw new ApiError(403, "You are not a participant of this exchange.");
    }
    
    if (exchange.status !== 'accepted' && exchange.status !== 'completed') {
        throw new ApiError(400, "Projects can only be created from accepted or completed exchanges.");
    }

    const project = await Project.create({
        title: `Project: ${exchange.topicToLearn.name} & ${exchange.topicToTeach.name}`,
        description: `Collaborative project between ${exchange.initiator.fullName} and ${exchange.receiver.fullName}.`,
        members: [exchange.initiator._id, exchange.receiver._id],
        relatedExchange: exchangeId,
    });

    exchange.project = project._id;
    await exchange.save();

    return res.status(201).json(new ApiResponse(201, project, "Project created successfully."));
});

const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const projects = await Project.find({ members: userId })
        .populate("members", "fullName avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, projects, "User projects retrieved successfully."));
});

const getProjectDetails = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID.");
    }

    const project = await Project.findById(projectId).populate("members", "fullName avatar");
    if (!project) {
        throw new ApiError(404, "Project not found.");
    }

    if (!project.members.some(member => member._id.equals(userId))) {
        throw new ApiError(403, "You are not a member of this project.");
    }

    const tasks = await Task.find({ project: projectId }).populate("assignee", "fullName avatar");

    const projectWithTasks = { ...project.toObject(), tasks };

    return res.status(200).json(new ApiResponse(200, projectWithTasks, "Project details retrieved successfully."));
});

const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, assignee } = req.body;
    const userId = req.user._id;

    if (!title) {
        throw new ApiError(400, "Task title is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID.");
    }

    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found.");
    if (!project.members.includes(userId)) throw new ApiError(403, "You are not a member of this project.");
    if (assignee && !project.members.includes(assignee)) throw new ApiError(400, "Assignee must be a project member.");

    const task = await Task.create({
        title,
        project: projectId,
        assignee: assignee || null,
    });

    const populatedTask = await Task.findById(task._id).populate("assignee", "fullName avatar");

    return res.status(201).json(new ApiResponse(201, populatedTask, "Task created successfully."));
});

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID.");
    }
    
    const task = await Task.findById(taskId).populate('project');
    if (!task) throw new ApiError(404, "Task not found.");
    if (!task.project.members.includes(userId)) throw new ApiError(403, "You are not authorized to update this task.");
    
    if (status) task.status = status;
    // other fields like title, assignee can be added here
    await task.save();

    const populatedTask = await Task.findById(task._id).populate("assignee", "fullName avatar");

    return res.status(200).json(new ApiResponse(200, populatedTask, "Task updated successfully."));
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID.");
    }

    const task = await Task.findById(taskId).populate('project');
    if (!task) throw new ApiError(404, "Task not found.");
    if (!task.project.members.includes(userId)) throw new ApiError(403, "You are not authorized to delete this task.");

    await Task.findByIdAndDelete(taskId);

    return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully."));
});

export {
    createProject,
    getUserProjects,
    getProjectDetails,
    createTask,
    updateTask,
    deleteTask,
};