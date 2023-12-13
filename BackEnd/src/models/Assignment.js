const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    course: {
      type: Object,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
