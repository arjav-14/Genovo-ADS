//get user credits
import * as Sentry from "@sentry/node";
import { Request , Response } from "express"
import { prisma } from "../configs/prisma.js";
export const getUserCredits = async (req : Request, res : Response) => {
    try{
        const {userId} = req.auth;
        if(!userId){
            return res.status(401).json({message : "Unauthorized"})
        }

        const user = await prisma.user.findUnique({
            where : {id : userId},
            select : {credits : true}
        })
        return res.status(200).json({credits : user?.credits || 0})
    }
    catch(error : any){
        Sentry.captureException(error);
        return res.status(500).json({message : error.message || "Internal Server Error"})
    }
}

// const get all user projects

export const getAllUserProjects = async (req : Request, res : Response) => {
    try{
        const {userId} = req.auth;
        if(!userId){
            return res.status(401).json({message : "Unauthorized"})
        }
        const projects = await prisma.project.findMany({
            where : {userId},
            orderBy : {createdAt : "desc"},
        })
        res.json({projects})
    }
    catch(error : any){
        Sentry.captureException(error);
        return res.status(500).json({message : error.message || "Internal Server Error"})
    }
}

// get project by id 

export const getProjectById = async (req : Request, res : Response) => {
    try{
        const userIdRawAuth = (req.auth as any)?.userId ?? (req.auth as any);
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if(!projectId){
            return res.status(400).json({message: "projectId is required"})
        }
        if(!userId){
            return res.status(401).json({message : "Unauthorized"})
        }
        const project = await prisma.project.findFirst({
            where: {id : projectId, userId}
        })
        if(!project){
            return res.status(404).json({message : "Project not found"})
        }
        res.json({project})
    }
    catch(error : any){
        Sentry.captureException(error);
        return res.status(500).json({message : error.message || "Internal Server Error"})
    }
}

// public / umpublish the project 
export const toggleProjectPublic = async (req : Request, res : Response) => {
    try{
        const userIdRawAuth = (req.auth as any)?.userId ?? (req.auth as any);
        const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;
        const projectIdRaw = req.params.projectId;
        const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
        if(!projectId){
            return res.status(400).json({message : "projectId is required"})
        }
        if(!userId){
            return res.status(401).json({message : "Unauthorized"})
        }
        const project = await prisma.project.findFirst({
            where: {id : projectId, userId}
        })
        if(!project){
            return res.status(404).json({message : "Project not found"})
        }
        if(!project?.generatedImage && !project?.generatedVideo){
            return res.status(400).json({message : "Cannot publish a project without generated media"}) 
        }
        await prisma.project.update({
            where : {id : projectId},
            data : {isPublished : !project.isPublished}
        })
        res.json({isPublished : !project.isPublished})
    }
    catch(error : any){
        Sentry.captureException(error);
        return res.status(500).json({message : error.message || "Internal Server Error"})
    }
}