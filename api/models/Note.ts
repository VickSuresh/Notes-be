import { assert } from "console";
import * as fs from "node:fs";

export default class Note {

    #title: string;
    #content: string;

    constructor(title: string, content: string) {
        assert(content.length <= 140, "Content length must be less than 140");
        this.#title = title;
        this.#content = content;
    }

    getTitle(): string {
        return this.#title;
    }


    editTitle(title: string): void {
        this.#title = title;
    }

    editContent(content: string): void {
        assert(content.length <= 140, "Content length must be less than 140");
        this.#content = content;
    }

    static async readNote(path: string): Promise<Note> {
        const obj: Buffer = await fs.promises.readFile(path);
        const json = JSON.parse(obj.toString());
        return new Note(json?.title, json?.content);
    }

    static exists(title: string): boolean {
        return fs.existsSync(`./notes/${title}.json`);
    }

    toJSON(): Object {
        return {
            title: this.#title,
            content: this.#content
        }
    }
}