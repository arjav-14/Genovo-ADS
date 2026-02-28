import "./configs/instrument.mjs";
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import ClerkWebhooks from "./controllers/clerk.js";
import * as Sentry from "@sentry/node";
import userRouter from "./routes/userRoutes.js";
import ProjectRouter from "./routes/projectRoutes.js";

const app = express();


// Middleware
app.use(cors());

app.post('/api/clerk',express.raw({ type: 'application/json' }) , ClerkWebhooks);
 
app.use(express.json());
app.use(clerkMiddleware());
const PORT = process.env.PORT || 3000;



app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.use("/api/user" , userRouter)
app.use("/api/project" , ProjectRouter)
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});