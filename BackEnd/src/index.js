require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authentication = require("./routes/authentication");
const course = require("./routes/course");
const library = require("./routes/library");
const assignment = require("./routes/assignment");
const submission = require("./routes/submission");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authentication);
app.use("/course", course);
app.use("/library", library);
app.use("/assignment", assignment);
app.use("/submission", submission);

const mongoUri =
  "mongodb+srv://admin:admin@atlascluster.sjusnfu.mongodb.net/black-board?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connection Established!");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

app.listen(5000, () => {
  console.log(`Server running on port: 5000!`);
});
