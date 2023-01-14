import Note from "../../api/models/Note";
import createError from "http-errors";
import * as fs from "node:fs/promises";
import * as NoteController from "../../api/controller/NoteController"

jest.mock("node:fs/promises", () => {
  return {
    writeFile: jest.fn(),
    readdir: jest.fn(),
    rm: jest.fn()
  }
})

jest.mock("../../api/models/Note");

describe("Note CRUD Tests", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  })

  describe("Create note", () => {

    it("Should throw an error if called without parameters, or incorrect parameters", async () => {
      //no params
      await expect(NoteController.createNote()).rejects.toThrowError(createError.BadRequest);

      //only one of title or content
      await expect(NoteController.createNote("aTitle")).rejects.toThrowError(createError.BadRequest);
    })

    it("Should throw a conflict error if there is already a note with given title", async () => {
      (Note.exists as jest.Mock).mockResolvedValue(true);
      await expect(NoteController.createNote("title", "content")).rejects.toThrowError(createError.Conflict);
    })

    it("Should call writeFile with correct inputs", async () => {

      (Note.getFileName as jest.Mock).mockReturnValue("title.json");
      let spy = jest.spyOn(Note.prototype, 'toJSON').mockImplementation(() => "mock content")

      await NoteController.createNote("title", "content");
      expect(fs.writeFile).toHaveBeenCalledWith("./notes/title.json", JSON.stringify("mock content"));
    })
  })

  describe("Read notes", () => {

    beforeEach(async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([1, 2, 3, 4]);
    })

    it("Should call read method as many times as there are files in directory", async () => {
      let notes: Note[] = await NoteController.readAllNotes();
      expect(Note.readNote).toHaveBeenCalledTimes(4);
    })

    it("Should return an array with length equal to number of files", async () => {
      (Note.readNote as jest.Mock).mockResolvedValue("something")
      let notes: Note[] = await NoteController.readAllNotes();
      expect(notes.length).toBe(4);
    })

  })

  describe("Update note", () => {


    beforeAll(() => {
      //initialize note class with dummy implementations
      let spy = jest.spyOn(Note.prototype, 'editTitle').mockImplementation((title) => { });
      let spy2 = jest.spyOn(Note.prototype, "getTitle").mockImplementation(() => "something");
      (Note.getFileName as jest.Mock).mockReturnValue("file");
    })

    it("Should throw 400 if there's no input", async () => {
      await expect(NoteController.updateNote()).rejects.toThrowError(createError.BadRequest);
    })

    it("Should throw 400 if theres only the title with no update params", async () => {
      (Note.exists as jest.Mock).mockReturnValue(true);
      await expect(NoteController.updateNote("title")).rejects.toThrowError(createError.BadRequest);
    })

    it("Should throw 409 if try to update note to title that exists", async () => {
      (Note.exists as jest.Mock).mockReturnValue(true);
      await expect(NoteController.updateNote("title", "exists", "content")).rejects.toThrowError(createError.Conflict);
    })

    it("Should throw 404 if note with title doesn't exist", async () => {
      (Note.exists as jest.Mock).mockReturnValue(false);
      await expect(NoteController.updateNote("fakeTitle", "title", "content")).rejects.toThrowError(createError.NotFound);
    })

    it("Should throw an error if length of content over 140", async () => {
      //to pass previous checks
      (Note.exists as jest.Mock).mockImplementation((title) => title === "title" ? true : false);
      let badContent: string = 'a'.repeat(141);
      await expect(NoteController.updateNote("title", "newTitle", badContent)).rejects.toThrowError(createError.BadRequest);
    })

    it("Should call fs.rm if theres a new title", async () => {
      //to pass previous checks
      (Note.exists as jest.Mock).mockImplementation((title) => title === "title" ? true : false);

      (Note.readNote as jest.Mock).mockResolvedValue(new Note("title", "content"));
      await NoteController.updateNote("title", "newTitle", "content");

      expect(fs.rm).toHaveBeenCalled();
    })

    it("Shouldn't call fs.rm if theres no new title", async () => {
      //to pass previous checks
      (Note.exists as jest.Mock).mockImplementation((title) => title === "title" ? true : false);

      (Note.readNote as jest.Mock).mockResolvedValue(new Note("title", "content"));
      await NoteController.updateNote("title", undefined, "content");

      expect(fs.rm).not.toHaveBeenCalled();
    });

    it("Should call write file", async () => {
      //to pass previous checks
      (Note.exists as jest.Mock).mockImplementation((title) => title === "title" ? true : false);

      (Note.readNote as jest.Mock).mockResolvedValue(new Note("title", "content"));
      await NoteController.updateNote("title", "newTitle", "content");

      expect(fs.writeFile).toHaveBeenCalled();
    });

  })

  describe("Delete note", () => {

    it("Should throw error if note doesn't exist", async () => {
      (Note.exists as jest.Mock).mockReturnValue(false);
      await expect(NoteController.deleteNote("title")).rejects.toThrowError(createError.NotFound);
    });

    it("Should call fs.rm if the file exists", async () => {

      (Note.exists as jest.Mock).mockReturnValue(true);
      await NoteController.deleteNote("title");

      expect(fs.rm).toHaveBeenCalled();

    })
  })
})