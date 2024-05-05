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


//Route 3: Update note using PUT "/api/notes/updatenote" .login required

router.put(
  "/updatenote/:id",
  fetchuser,
  async (req, res) => {
    try {
      //using destructuring to get data from the request
      const { title, description, tag } = req.body;
      //Create a newNote object
      const newNote ={};
      if(title){newNote.title = title}
      if(description){newNote.description = description}
      if(tag){newNote.tag = tag}
      
      //Find the note to be updated and update it
      let note = await Note.findById(req.params.id);
      if(!note){
        return res.status(404).send("Not Found");
      }
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }
      //update that note
      note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true});
      //return the note
      res.json(note);
    } catch (error) {
      console.error(error.messae);
      res.status(500).send("Internal Server Error");
    }
  }
);


//Route 3: Delete note using DELETE "/api/notes/deletenote" .login required

router.delete(
  "/deletenote/:id",
  fetchuser,
  async (req, res) => {
    try {
      //using destructuring to get data from the request
      const { title, description, tag } = req.body;
      
      //Find the note to be updated and update it
      let note = await Note.findById(req.params.id);
      if(!note){
        return res.status(404).send("Not Found");
      }
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }
      //update that note
      note = await Note.findByIdAndDelete(req.params.id);
      //return the note
      res.json({"success":"Note deleted successfully", note: note});
    } catch (error) {
      console.error(error.messae);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
