import Note from "../models/Note";
import createError from "http-errors";
import * as fs from "node:fs/promises";

export async function createNote(title?: string, content?: string): Promise<Note> {

    if (!(title && content)) {
        throw createError.BadRequest("All input required");
    }

    if (content.length >= 140) {
        throw createError.BadRequest("Note length must be less than 140 characters");
    }

    if (Note.exists(title)) {
        throw createError.Conflict("File already exists");
    }

    const note: Note = new Note(title, content);

    await fs.writeFile(`./notes/${Note.getFileName(title)}`, JSON.stringify(note));

    return note;
}


export async function readAllNotes(): Promise<Note[]> {

    const files: string[] = await fs.readdir("./notes");

    const notes: Note[] = await Promise.all(files.map(async (file) => {
        return await Note.readNote(`./notes/${file}`);
    }));

    return notes;
}

export async function updateNote(title: string, newTitle?: string, newContent?: string): Promise<Note> {

    if (!title) {
        throw createError.BadRequest("Title required");
    }

    if (!(newTitle || newContent)) {
        throw createError.BadRequest("Some input required");
    }

    if (!Note.exists(title)) {
        throw createError.NotFound("Note doesn't exist");
    }

    if (newTitle && Note.exists(newTitle)) {
        throw createError.Conflict("Note already exists with new title");
    }

    if (newContent && newContent.length >= 140) {
        throw createError.BadRequest("Note length must be less than 140 characters");
    }

    let fileName: string = Note.getFileName(title);

    const note: Note = await Note.readNote(`./notes/${fileName}`);

    if (newTitle) {
        note.editTitle(newTitle);
        await fs.rm(`./notes/${fileName}`);
        fileName = Note.getFileName(note.getTitle());
    }

    if (newContent) note.editContent(newContent);

    await fs.writeFile(`./notes/${fileName}`, JSON.stringify(note));
    return note;

}

export async function deleteNote(title: string): Promise<void> {

    if (!Note.exists(title)) {
        throw createError.NotFound("Note doesn't exist");
    }

    await fs.rm(`./notes/${Note.getFileName(title)}`);
}