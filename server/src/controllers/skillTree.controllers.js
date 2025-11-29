import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SkillTree } from "../models/skillTree.models.js";
import { SkillNode } from "../models/skillNode.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const getAllSkillTrees = asyncHandler(async (req, res) => {
    const skillTrees = await SkillTree.find().select("name description icon");
    return res.status(200).json(new ApiResponse(200, skillTrees, "Skill trees retrieved successfully."));
});

const getSkillTreeDetails = asyncHandler(async (req, res) => {
    const { treeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(treeId)) {
        throw new ApiError(400, "Invalid skill tree ID.");
    }

    const skillTree = await SkillTree.findById(treeId);
    if (!skillTree) {
        throw new ApiError(404, "Skill tree not found.");
    }

    // Helper function to recursively populate children
    const populateChildren = async (nodeId) => {
        const node = await SkillNode.findById(nodeId).populate('topic', 'name description');
        if (!node) return null;
        
        const children = await Promise.all(node.children.map(childId => populateChildren(childId)));
        
        return {
            ...node.toObject(),
            children: children.filter(c => c !== null) // Filter out any nulls if a child node was not found
        };
    };

    const populatedRootNodes = await Promise.all(skillTree.rootNodes.map(rootId => populateChildren(rootId)));

    const responseTree = {
        ...skillTree.toObject(),
        nodes: populatedRootNodes.filter(n => n !== null)
    };

    return res.status(200).json(new ApiResponse(200, responseTree, "Skill tree details retrieved successfully."));
});


const getUserProgress = asyncHandler(async (req, res) => {
    const { treeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(treeId)) {
        throw new ApiError(400, "Invalid skill tree ID.");
    }

    // Find all nodes that belong to the specified skill tree
    const nodesInTree = await SkillNode.find({ skillTree: treeId }).select('_id');
    const nodeIdsInTree = new Set(nodesInTree.map(node => node._id.toString()));

    const user = await User.findById(userId).select('completedSkillNodes');
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Filter the user's completed nodes to only include those in the current tree
    const progressInTree = user.completedSkillNodes.filter(nodeId => nodeIdsInTree.has(nodeId.toString()));

    return res.status(200).json(new ApiResponse(200, progressInTree, "User progress retrieved successfully."));
});

export {
    getAllSkillTrees,
    getSkillTreeDetails,
    getUserProgress
};
