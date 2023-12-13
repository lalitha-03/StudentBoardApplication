const multer = require("multer");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "../../files/") });

const express = require("express");
const fs = require("fs");

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const requireAuth = require("../services/requireAuth");
const awsS3 = require("../services/awss3");

const constants = require("../constants");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    let courses = null;

    if (req.role === "student") {
      const enrollments = await Enrollment.find({ studentId: req.user._id });
      const enrolledCourseIdsSet = new Set(
        enrollments.map((enrollment) => enrollment.courseId)
      );

      courses = await Course.find(
        {},
        { syllabus: 0, enrolled: 0, enrollmentLimit: 0 }
      );

      courses = courses.map((course) => {
        const isEnrolled = enrolledCourseIdsSet.has(course._id.toString());
        return { ...course.toObject(), isEnrolled };
      });
    } else {
      courses = await Course.find({}, { syllabus: 0 });
    }

    if (!courses) return res.status(422).send({ msg: "No courses found!" });

    res.status(200).send({ data: courses });
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.get("/downloadSyllabus/:courseId", requireAuth, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findOne({ _id: courseId }, { syllabus: 1 });

    if (!course) return res.status(422).send({ msg: "Course not found!" });

    awsS3.downloadFromS3Url(course.syllabus, res);
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/enrollment/:courseId", requireAuth, async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(401).send({ msg: "Invalid request!" });
    }
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Validate enrollment
    let enrollment = await Enrollment.findOne({ studentId, courseId });

    if (enrollment) {
      return res.status(422).send({ msg: "Already Enrolled!" });
    }

    // Update course enrollment
    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        $expr: { $lt: ["$enrolled", "$enrollmentLimit"] },
      },
      { $inc: { enrolled: 1 } }
    );

    if (!course)
      return res.status(422).send({ msg: "Enrollment Limit Exceeded!" });

    // save enrollment
    const payload = {
      courseId,
      studentId,
    };

    enrollment = new Enrollment(payload);
    enrollment = await enrollment.save();

    if (!course) return res.status(422).send({ msg: "Something went wrong!" });

    res.status(200).send({ msg: "Enrolled to course!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.role === "student") {
      return res.status(401).send({ msg: "Invalid request" });
    }
    const courseId = req.params.id;

    const result = await Course.findOneAndDelete({
      _id: courseId,
      enrolled: 0,
    });

    if (!result)
      return res
        .status(422)
        .send({ msg: "Course already Enrolled by Students!" });

    res.status(200).send({ msg: "Course deleted!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/", requireAuth, upload.single("syllabus"), async (req, res) => {
  try {
    console.log(req.role, "role");
    if (req.role == "student") {
      console.log("hi", "hi");

      return res.status(401).send({ msg: "Invalid request" });
    }
    console.log("hello");

    const { name, enrollmentLimit, description } = req.body;

    if (!constants.isValidString(name) || !constants.isValidString(description))
      return res.status(422).send({ msg: "Invalid Name or Description!" });

    if (!constants.isValidInteger(enrollmentLimit))
      return res.status(422).send({ msg: "Invalid Enrollment Limit!" });

    // File upload
    const file = req.file;

    if (!file) return res.status(422).send({ msg: "Invalid File Upload!" });
    if (file.mimetype !== "application/pdf")
      return res.status(422).send({ msg: "file Type should be pdf!" });

    const folderName = name + "/syllabus";
    const fileContent = fs.readFileSync(file.path);
    const fileName = `${Date.now().toString()}.pdf`;

    const s3Url = await awsS3.uploadToS3(folderName, fileName, fileContent);

    fs.unlink(file.path, (error) => {
      if (error) console.log(error);
    });

    // save course
    const payload = {
      name,
      enrollmentLimit,
      description,
      syllabus: s3Url,
      enrolled: 0,
    };

    let course = new Course(payload);
    course = await course.save();

    if (!course) return res.status(422).send({ msg: "Something went wrong!" });

    res.status(200).send({ msg: "Course added!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

module.exports = router;
