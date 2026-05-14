//get user credits
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
export const getUserCredits = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        // Create user if doesn't exist
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: req.auth?.sessionClaims?.email || "",
                    credits: 10 // Give new users 10 credits
                },
                select: { credits: true }
            });
        }
        return res.status(200).json({ credits: user?.credits || 0 });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
// const get all user projects
export const getAllUserProjects = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json({ projects });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
// get project by id 
export const getProjectById = async (req, res) => {
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ project });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
// public / umpublish the project 
export const toggleProjectPublic = async (req, res) => {
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project?.generatedImage && !project?.generatedVideo) {
            return res.status(400).json({ message: "Cannot publish a project without generated media" });
        }
        await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        });
        res.json({ isPublished: !project.isPublished });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const unpublishProject = async (req, res) => {
    console.log(" Unpublish request received:", {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        body: req.body,
        user: req.auth
    });
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log(" Looking for project:", { projectId, userId });
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        console.log(" Project found:", project ? "YES" : "NO");
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        console.log(" Updating project isPublished to false");
        await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: false }
        });
        console.log(" Project unpublished successfully");
        res.json({ isPublished: false });
    }
    catch (error) {
        console.error(" Unpublish error:", error);
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
