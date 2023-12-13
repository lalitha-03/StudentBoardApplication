const express = require("express");

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const requireAuth = require("../services/requireAuth");

const router = express.Router();

router.get("/:courseId", requireAuth, async (req, res) => {
  try {
    if (req.role == "student") {
      return res.status(401).send({ msg: "Invalid request!" });
    }
    const { courseId } = req.params;

    let enrollments = await Enrollment.find({ courseId }).populate({
      path: "studentId",
      model: "Student",
      select: "firstName lastName",
    });

    if (!enrollments)
      return res.status(422).send({ msg: "No enrollments found!" });

    res.status(200).send({ data: enrollments });
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/:courseId", requireAuth, async (req, res) => {
  try {
    if (req.role !== "student")
      return res.status(401).send({ msg: "Invalid request!" });

    const { courseId } = req.params;
    const studentId = req.user._id;

    // Validate enrollment
    let enrollment = await Enrollment.findOne({ studentId, courseId });

    if (enrollment) return res.status(422).send({ msg: "Already Enrolled!" });

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

module.exports = router;
