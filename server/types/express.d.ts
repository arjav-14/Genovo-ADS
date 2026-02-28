import {Request} from "express";

declare global {
    namespace Express {
        interface Request {
            auth: AuthObject;
            plan? : string;
            file : any;
        }   
    }
}