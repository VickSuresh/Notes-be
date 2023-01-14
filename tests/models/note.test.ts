import Note from "../../api/models/Note";
import * as fs from "node:fs";

jest.mock("node:fs", () => {
  return {
    promises: {
      readFile: jest.fn()
    },
    existsSync: jest.fn()
  };
});

describe('Note Model', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  })

  describe("Filename method", () => {
    let noteTitle: string = "Contains CaPitals and spaces"
    it("Should return a lowercase json filename with underscores instead of spaces", () => {
      expect(Note.getFileName(noteTitle)).toBe("contains_capitals_and_spaces.json");
    })
  })

  describe("Read method", () => {

    let dummyFile: string = "filename.json";
    let dummyNote = {
      title: "title",
      content: "content"
    }

    beforeEach(() => {
      (fs.promises.readFile as jest.Mock).mockResolvedValue(Buffer.from(JSON.stringify(dummyNote)));
    })

    it("Should call fs.promises.readFile with the given path", async () => {
      let note: Note = await Note.readNote(dummyFile);
      expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
      expect(fs.promises.readFile).toHaveBeenCalledWith(dummyFile);
    })

    it("Should return a note that contains the correct values of the file", async () => {
      let note: Note = await Note.readNote(dummyFile);
      expect(note.toJSON()).toStrictEqual(dummyNote);
    })

  })

  describe("Exists method", () => {

    it("Should call existsSync with correct filename", () => {
      (fs.existsSync as jest.Mock).mockResolvedValue(true);
      Note.exists("title");
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenCalledWith("./notes/title.json");
    });
  })

})