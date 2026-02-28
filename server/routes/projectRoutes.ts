import express from 'express';
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { createProject, createVideo, DeleteProject, getAllPublishedProjects, publishProject, unpublishProject } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const ProjectRouter = express.Router();

ProjectRouter.post("/create" , upload ,  protect ,  createProject);
ProjectRouter.post("/video" , protect, createVideo);
ProjectRouter.post("/publish" , protect, publishProject);
ProjectRouter.post("/unpublish" , protect, unpublishProject);
ProjectRouter.get("/published" , getAllPublishedProjects);
ProjectRouter.delete("/:projectId" , protect, DeleteProject);   

export default ProjectRouter;