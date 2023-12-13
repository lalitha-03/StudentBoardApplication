const multer = require("multer");
const upload = multer({ dest: "../../files/" });

const fs = require("fs");
const express = require("express");

const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

const awsS3 = require("../services/awss3");
const requireAuth = require("../services/requireAuth");
const sendEmail = require("../services/nodeMailer");

const constants = require("../constants");

const router = express.Router();

router.get("/:assignmentId", requireAuth, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    let query = { assignmentId };

    if (req.role === "student") {
      query = { studentId: { $in: req.user._id }, assignmentId };
    }

    const submissions = await Submission.find(query, { document: 0 }).populate({
      path: "studentId",
      model: "Student",
      select: "firstName lastName",
    });

    if (!submissions)
      return res.status(422).send({ msg: "No submissions found!" });

    res.status(200).send({ data: submissions });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.get("/download/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const submission = await Submission.findById(id, { document: 1 });

    if (!submission)
      return res.status(422).send({ msg: "Invalid Submission Id!" });

    awsS3.downloadFromS3Url(submission.document, res);
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/", requireAuth, upload.single("document"), async (req, res) => {
  try {
    if (req.role !== "student")
      return res.status(401).send({ msg: "Invalid request" });

    const { instructions, assignmentId } = req.body;

    if (!constants.isValidString(instructions))
      return res.status(422).send({ msg: "Invalid Instructions!" });

    if (!constants.isValidObjectId(assignmentId))
      return res.status(422).send({ msg: "Invalid Assignment Id!" });

    // Validate assignment
    const assignment = await Assignment.findOne(
      { _id: assignmentId },
      { _id: 1, course: 1 }
    );

    if (!assignment)
      return res.status(422).send({ msg: "Assignment not found!" });

    // Validate submission
    let submission = await Submission.findOne({
      studentId: req.user._id,
      assignmentId,
    });

    if (submission)
      return res.status(422).send({ msg: "Assignment already submitted!" });

    // File upload
    const file = req.file;

    if (!file) return res.status(422).send({ msg: "Invalid File Upload!" });
    if (file.mimetype !== "application/pdf")
      return res.status(422).send({ msg: "file Type should be pdf!" });

    const folderName = assignment.course.name + "/submission";
    const fileContent = fs.readFileSync(file.path);
    const fileName = `${Date.now().toString()}.pdf`;

    const s3Url = await awsS3.uploadToS3(folderName, fileName, fileContent);

    fs.unlink(file.path, (error) => {
      if (error) console.log(error);
    });

    // save submission
    const payload = {
      instructions,
      document: s3Url,
      assignmentId,
      studentId: req.user._id,
    };

    submission = new Submission(payload);
    submission = await submission.save();

    if (!submission)
      return res.status(422).send({ msg: "Something went wrong!" });

    res.status(200).send({ msg: "Assignment submitted!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.put("/:submissionId", requireAuth, async (req, res) => {
  try {
    if (req.role == "student") {
      return res.status(401).send({ msg: "Invalid request" });
    }
    const { remarks, marks } = req.body;
    const { submissionId } = req.params;

    if (!constants.isValidString(remarks))
      return res.status(422).send({ msg: "Invalid remarks!" });

    if (!constants.isValidInteger(marks))
      return res.status(422).send({ msg: "Invalid marks!" });

    // Validate submission
    let submission = await Submission.findOne(
      { _id: submissionId },
      { assignmentId: 1, studentId: 1 }
    ).populate({ model: "Student", path: "studentId" });

    if (!submission)
      return res.status(422).send({ msg: "Submission not found!" });

    // Validate assignment
    let assignment = await Assignment.findById(submission.assignmentId, {
      _id: 1,
      name: 1,
      course: 1,
      marks: 1,
    });

    if (!assignment)
      return res.status(422).send({ msg: "Submission not found!" });

    if (marks > assignment.marks)
      return res
        .status(422)
        .send({ msg: "Marks cannot be greater that Total Marks!!" });

    await Submission.findByIdAndUpdate(submissionId, {
      $set: { marks, remarks },
    });

    const emailSubject = `Assignment Submission Results for ${assignment.name}`;
    const emailBody = `
                  Dear Student,

                  We would like to inform you about the assessment results for your submission of ${assignment.name} in the ${assignment.course.name} course.

                  Marks Obtained: ${marks}
                  Remarks: ${remarks}

                  Get in touch with your professor if you have any doubts.

                  Best regards,
                  UCM
                  `;
    console.log(submission);
    sendEmail(submission.studentId.email, emailSubject, emailBody);

    res.status(200).send({ msg: "Assignment submitted!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

module.exports = router;
