const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route 1: Get all notes using GET "/api/notes/fetchallnotes" .login required

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.messae);
    res.status(500).send("Internal Server Error");
  }
});

//Route 2: Add note using POST "/api/notes/addnote" .login required

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title must be filled.").isLength({ min: 3 }),
    body(
      "description",
      "Description must be filled or min 5 character long."
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      //using destructuring to get data from the request
      const { title, description, tag } = req.body;
      //If there are errors return bad request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      //save that note
      const savedNote = await note.save();
      //return the note
      res.json(savedNote);
    } catch (error) {
      console.error(error.messae);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
