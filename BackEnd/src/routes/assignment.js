const multer = require("multer");
const upload = multer({ dest: "../../files/" });

const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");

const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");

const awsS3 = require("../services/awss3");
const requireAuth = require("../services/requireAuth");

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

    const assignments = await Assignment.find(query, { document: 0 });

    if (!assignments)
      return res.status(422).send({ msg: "No assignments found!" });

    res.status(200).send({ data: assignments });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.get("/download/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const assignment = await Assignment.findOne({ _id: id }, { document: 1 });

    if (!assignment)
      return res.status(422).send({ msg: "Assignment not found!" });

    awsS3.downloadFromS3Url(assignment.document, res);
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/", requireAuth, upload.single("document"), async (req, res) => {
  try {
    if (req.role == "student")
      return res.status(401).send({ msg: "Invalid request" });

    const { name, instructions, marks, courseId } = req.body;

    if (
      !constants.isValidString(name) ||
      !constants.isValidString(instructions)
    )
      return res.status(422).send({ msg: "Invalid Name or Instructions!" });

    if (!constants.isValidInteger(marks))
      return res.status(422).send({ msg: "Invalid Marks!" });

    if (!constants.isValidObjectId(courseId))
      return res.status(422).send({ msg: "Invalid Course Id!" });

    // Validate course
    const course = await Course.findOne(
      { _id: courseId },
      { name: 1, instructions: 1 }
    );

    if (!course) return res.status(422).send({ msg: "Course not found!" });

    // File upload
    const file = req.file;

    if (!file) return res.status(422).send({ msg: "Invalid File Upload!" });
    if (file.mimetype !== "application/pdf")
      return res.status(422).send({ msg: "file Type should be pdf!" });

    const folderName = course.name + "/assignment";
    const fileContent = fs.readFileSync(file.path);
    const fileName = `${Date.now().toString()}.pdf`;

    const s3Url = await awsS3.uploadToS3(folderName, fileName, fileContent);

    fs.unlink(file.path, (error) => {
      if (error) console.log(error);
    });

    // save assignment
    const payload = {
      name,
      instructions,
      marks,
      course,
      document: s3Url,
    };

    let assignment = new Assignment(payload);
    assignment = await assignment.save();

    if (!assignment)
      return res.status(422).send({ msg: "Something went wrong!" });

    res.status(200).send({ msg: "Assignment created!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

module.exports = router;
