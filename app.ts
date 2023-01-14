import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import createError, { HttpError } from "http-errors";
import noteRouter from "./api/routes/NoteRoutes";
import { mkdirSync, existsSync } from "node:fs";

dotenv.config();

//create directory if it doesn't exist
if (!existsSync('./notes')) mkdirSync('./notes');

const app: Express = express();

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//CORS
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "*");
        return res.status(200).json({});
    }
    next();
});

app.use('/notes', noteRouter);

//404 error
app.use((req: Request, res: Response, next: NextFunction) => {
    const error: HttpError = createError.NotFound();
    next(error);
});

//error handler
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    res.status(error.statusCode || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

export default app;