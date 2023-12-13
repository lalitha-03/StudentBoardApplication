const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    instructions: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    assignmentId: {
      type: Object,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
