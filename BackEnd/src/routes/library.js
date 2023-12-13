const multer = require("multer");
const upload = multer({ dest: "../../files/" });

const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");

const Course = require("../models/Course");
const Library = require("../models/Library");
const Enrollment = require("../models/Enrollment");

const requireAuth = require("../services/requireAuth");
const awsS3 = require("../services/awss3");

const constants = require("../constants");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    let query = {};

    if (req.role === "student") {
      const enrollments = await Enrollment.find({ studentId: req.user._id });
      const enrolledCourseIdsSet = enrollments.map(
        (enrollment) => new mongoose.Types.ObjectId(enrollment.courseId)
      );

      query = { "course._id": { $in: enrolledCourseIdsSet } };
    }

    const books = await Library.find(query, { url: 0 });

    if (!books) return res.status(422).send({ msg: "No books found!" });

    res.status(200).send({ data: books });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.get("/downloadBook/:bookId", requireAuth, async (req, res) => {
  try {
    const bookId = req.params.bookId;

    const book = await Library.findOne({ _id: bookId }, { url: 1 });

    if (!book) return res.status(422).send({ msg: "Book not found!" });

    awsS3.downloadFromS3Url(book.url, res);
  } catch (e) {
    console.log(e, "53");
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/", requireAuth, upload.single("book"), async (req, res) => {
  try {
    if (req.role == "student") {
      return res.status(401).send({ msg: "Invalid request" });
    }
    const { name, author, courseId } = req.body;

    if (!constants.isValidString(name) || !constants.isValidString(author))
      return res.status(422).send({ msg: "Invalid Name or Author!" });

    if (!constants.isValidObjectId(courseId))
      return res.status(422).send({ msg: "Invalid Course Id!" });

    const course = await Course.findOne(
      { _id: courseId },
      { name: 1, description: 1 }
    );

    if (!course) return res.status(422).send({ msg: "Course not found!" });

    // File upload
    const file = req.file;

    if (!file) return res.status(422).send({ msg: "Invalid File Upload!" });
    if (file.mimetype !== "application/pdf")
      return res.status(422).send({ msg: "file Type should be pdf!" });

    const folderName = course.name + "/library";
    const fileContent = fs.readFileSync(file.path);
    const fileName = `${Date.now().toString()}.pdf`;

    const s3Url = await awsS3.uploadToS3(folderName, fileName, fileContent);

    fs.unlink(file.path, (error) => {
      if (error) console.log(error);
    });

    // save book
    const payload = {
      name,
      author,
      course,
      url: s3Url,
    };

    let library = new Library(payload);
    library = await library.save();

    if (!library) return res.status(422).send({ msg: "Something went wrong!" });

    res.status(200).send({ msg: "Book added to library!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.role == "student") {
      return res.status(401).send({ msg: "Invalid request" });
    }
    const bookId = req.params.id;

    const result = await Library.findByIdAndDelete(bookId, { new: true });

    if (!result) return res.status(422).send({ msg: "Book not found!" });

    res.status(200).send({ msg: "Book deleted!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

module.exports = router;
