import express from "express";
import { get } from "node:http";
import { getAllUserProjects, getProjectById, getUserCredits, toggleProjectPublic, unpublishProject } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();
userRouter.get("/credits", protect, getUserCredits);
userRouter.get("/projects",protect, getAllUserProjects);
userRouter.get("/projects/:projectId", protect, getProjectById);
userRouter.post("/publish/:projectId", protect, toggleProjectPublic);
userRouter.post("/unpublish/:projectId", protect, unpublishProject);

export default userRouter;