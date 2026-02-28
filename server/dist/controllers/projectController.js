import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from 'cloudinary';
import ai from '../configs/ai.js';
import { HarmBlockThreshold, HarmCategory } from '@google/genai';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
const loadImage = (path, mimeType) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64'),
            mimeType
        }
    };
};
export const createProject = async (req, res) => {
    let tempProjectId;
    const userIdRawAuth = req.auth?.userId ?? req.auth;
    const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    let isCreditDeducted = false;
    const { name = 'New Project', aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body;
    // Handle files from .fields() - req.files is now an object with field names as keys
    const filesObj = req.files || {};
    const images = [...(filesObj.productImage || []), ...(filesObj.modelImage || [])];
    if (images.length < 2 || !productName) {
        return res.status(400).json({ message: "Please provide all required fields and 2 reference images" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.credits ?? 0) < 5) {
        return res.status(404).json({ message: 'User not found or insufficient credits' });
    }
    else {
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        }).then(() => {
            isCreditDeducted = true;
        });
    }
    try {
        let uploadedImages = await Promise.all(images.map((item) => {
            return cloudinary.uploader.upload(item.path, {
                resource_type: "image",
            });
        })).then((results) => {
            return results.map((result) => result.secure_url);
        });
        const project = await prisma.project.create({
            data: {
                name: String(name),
                userId: String(userId),
                productName: String(productName),
                productDescription: String(productDescription),
                userPrompt: String(userPrompt),
                aspectRatio: String(aspectRatio),
                targetLength: String(targetLength),
                uploadedImages,
                isGenerating: true,
            }
        });
        tempProjectId = project.id;
        const model = 'gemini-3-pro-image-preview';
        const generationConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspectRatio || "9:16",
                imageSize: '1K'
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF,
                }
            ]
        };
        //image to base64 structure for ai model
        const img1base64 = loadImage(images[0].path, images[0].mimetype);
        const img2base64 = loadImage(images[1].path, images[1].mimetype);
        const prompt = {
            text: `Combine the person and the product into relastic photo.
            Make the person naturally hold or use the product.
            Match lighting , shadows , scale and perspective.
            Make the person stand in the professional studio lighting.
            Output ecommerce-quality photo relastic imagery.
            ${userPrompt}`
        };
        //generate the image using the ai model
        const response = await ai.models.generateContent({ model,
            contents: [prompt, img1base64, img2base64],
            config: generationConfig,
        });
        //check if the response is valid
        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error("Invalid response from AI model");
        }
        const parts = response.candidates[0].content.parts;
        let finalBuffer = null;
        for (const part of parts) {
            if (part.inlineData?.data) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64');
            }
        }
        if (!finalBuffer) {
            throw new Error("No image data found in AI response");
        }
        const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            resource_type: "image"
        });
        await prisma.project.update({
            where: { id: tempProjectId },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        });
        res.json({ projectId: project.id });
    }
    catch (error) {
        if (tempProjectId) {
            await prisma.project.update({
                where: { id: tempProjectId },
                data: { isGenerating: false, error: error.message }
            });
        }
        if (isCreditDeducted) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            });
        }
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const createVideo = async (req, res) => {
    const userIdRawAuth = req.auth?.userId ?? req.auth;
    const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const projectIdRaw = req.body.projectId || req.params.projectId;
    const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
    let isCreditDeducted = false;
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user || (user.credits ?? 0) < 10) {
        return res.status(404).json({ message: "User not found or insufficient credits" });
    }
    //deduct credit for video generation                                                                                qddg
    const VIDEO_GENERATION_COST = 10; // Define cost as constant for easy maintenance
    const userCredits = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });
    if (!userCredits || (userCredits.credits ?? 0) < VIDEO_GENERATION_COST) {
        return res.status(400).json({ message: `Insufficient credits for video generation. You need at least ${VIDEO_GENERATION_COST} credits.` });
    }
    await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: VIDEO_GENERATION_COST } }
    }).then(() => {
        isCreditDeducted = true;
    });
    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId },
            include: { user: true }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (project.isGenerating) {
            return res.status(400).json({ message: "Project is in generation progress" });
        }
        if (project.generatedVideo) {
            return res.status(400).json({ message: "Video already generated for this project" });
        }
        await prisma.project.update({
            where: { id: project.id },
            data: { isGenerating: true }
        });
        const prompt = `Create a 15-second dynamic video showcasing the product ${project.productName}. ${project.productDescription && `Product Description: ${project.productDescription}`}. The person should naturally demonstrate or interact with the product with smooth movements and engaging actions. Make it cinematic and professional. Generate the video in English language with English text and audio if any.`;
        const model = "veo-3.1-generate-preview";
        if (!project.generatedImage) {
            throw new Error("No generated image found for this project");
        }
        const image = await axios.get(project.generatedImage, { responseType: 'arraybuffer' });
        const imageBytes = Buffer.from(image.data);
        let operation = await ai.models.generateVideos({
            model, prompt, image: {
                imageBytes: imageBytes.toString('base64'),
                mimeType: 'image/png'
            },
            config: {
                aspectRatio: project.aspectRatio || "9:16",
                numberOfVideos: 1,
                resolution: '720p'
            }
        });
        console.log("Initial video operation:", JSON.stringify(operation, null, 2));
        // poll for completion with a max attempts timeout to avoid infinite loops
        const maxAttempts = 60; // ~10 minutes with 10s interval
        let attempts = 0;
        while (!operation.done) {
            if (attempts++ >= maxAttempts) {
                console.error('Video generation timed out after', attempts, 'attempts');
                break;
            }
            console.log("Video generation in progress... attempt:", attempts);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            try {
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            catch (e) {
                console.error('Error fetching video operation status:', e);
                // continue polling; the next iteration may succeed
            }
            console.log("Polled operation status:", JSON.stringify(operation, null, 2));
        }
        const filename = `${userId}-${Date.now()}.mp4`;
        const filepath = path.join('videos', filename);
        //create the image directory if not present
        fs.mkdirSync('videos', { recursive: true });
        // Validate response safely
        const opResponse = operation?.response;
        if (!opResponse || !Array.isArray(opResponse.generatedVideos) || opResponse.generatedVideos.length === 0) {
            const reason = opResponse?.raiMediaFilterReasons ?? opResponse?.raiMediaFilteresReasons ?? operation?.error ?? 'No generated videos returned';
            console.error('Video generation failed or filtered. Operation response:', JSON.stringify(opResponse, null, 2));
            throw new Error(String(reason));
        }
        await ai.files.download({
            file: opResponse.generatedVideos[0].video,
            downloadPath: filepath,
        });
        const uploadResult = await cloudinary.uploader.upload(filepath, {
            resource_type: "video"
        });
        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false,
            }
        });
        fs.unlinkSync(filepath);
        res.json({ message: "Video generated successfully", videoUrl: uploadResult.secure_url });
    }
    catch (error) {
        // attempt to clear isGenerating and save error on the project if it exists
        try {
            if (projectId) {
                const existing = await prisma.project.findUnique({ where: { id: projectId } });
                if (existing) {
                    await prisma.project.update({
                        where: { id: projectId },
                        data: { isGenerating: false, error: error.message }
                    });
                }
            }
        }
        catch (e) {
            // ignore update errors here, we'll still attempt credit rollback
        }
        // rollback full deducted credits for video (10)
        if (isCreditDeducted) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 10 } }
            });
        }
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const getAllPublishedProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true },
        });
        res.json({ projects });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const publishProject = async (req, res) => {
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const projectIdRaw = req.body.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        console.log("Publishing project:", { projectId, userId });
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.generatedImage) {
            return res.status(400).json({ message: "Project must have a generated image to be published" });
        }
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: true }
        });
        res.json({ message: "Project published successfully", project: updatedProject });
    }
    catch (error) {
        console.error("Publish project error:", error);
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const unpublishProject = async (req, res) => {
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const projectIdRaw = req.body.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        console.log("Unpublishing project:", { projectId, userId });
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { isPublished: false }
        });
        res.json({ message: "Project unpublished successfully", project: updatedProject });
    }
    catch (error) {
        console.error("Unpublish project error:", error);
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const DeleteProject = async (req, res) => {
    try {
        const userIdRawAuth = req.auth?.userId ?? req.auth;
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Get projectId from URL params (since route is /:projectId)
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }
        console.log("Deleting project:", { projectId, userId });
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        await prisma.project.delete({
            where: { id: projectId }
        });
        res.json({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("Delete project error:", error);
        Sentry.captureException(error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
