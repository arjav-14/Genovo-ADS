import express from 'express';
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { createProject, createVideo, DeleteProject, getAllPublishedProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const ProjectRouter = express.Router();

ProjectRouter.post("/create" , upload ,  protect ,  createProject);
ProjectRouter.post("/video" , protect, createVideo);
ProjectRouter.get("/published" , getAllPublishedProjects);
ProjectRouter.delete("/:projectId" , protect, DeleteProject);   


export default ProjectRouter;