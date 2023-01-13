import express, { Express, Request, Response, NextFunction, Router } from "express";
import * as NoteController from "../controller/NoteController";
import Note from "../models/Note";

var router: Router = express.Router();

router.post('/createNote', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { title, content } = req.body;
        const note: Note = await NoteController.createNote(title, content);

        res.status(201).json(note);
    } catch (err) {
        next(err);
    }
});

router.get('/getNotes', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const data: Note[] = await NoteController.readAllNotes();
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

router.put('/updateNote', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const {
            title,
            newTitle,
            newContent
        } = req.body;

        const note: Note = await NoteController.updateNote(title, newTitle, newContent);
        res.status(201).json(note);
    } catch (err) {
        next(err);
    }
});

router.delete('/deleteNote/:title', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const title = req.params.title;
        await NoteController.deleteNote(title);
        res.status(200).send("Successfully deleted");
    } catch (err) {
        next(err);
    }
});

export default router;


