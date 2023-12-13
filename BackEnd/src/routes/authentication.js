const express = require("express");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const Admin = require("../models/Admin");

const constants = require("../constants");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // validation
    if (
      !constants.isValidString(firstName) ||
      !constants.isValidString(lastName)
    )
      return res.status(422).send({ msg: "Invalid First and Last Name!" });

    if (!constants.isValidEmail(email))
      return res.status(422).send({ msg: "Invalid Email!" });

    if (typeof password !== "string" || password.length < 8)
      return res.status(422).send({ msg: "Minimum password length 8!" });

    // check if email exists
    let student = await Student.findOne({ email });
    if (student)
      return res.status(422).send({ msg: "Email already registered!" });
    let type = "student";
    // save student
    const payload = {
      firstName,
      lastName,
      email,
      password,
      type,
    };

    student = new Student(payload);
    student = await student.save();

    if (!student) return res.status(422).send({ msg: "Student didn't saved!" });

    res.status(200).send({ msg: "Student registered!" });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

router.post("/login/:type", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { type } = req.params;

    // validation
    if (!email || !password)
      return res.status(422).send({ msg: "Fill the Form!" });

    let user = null;
    let Model = null;

    const filter = {
      email,
      password,
      type,
    };

    if (type === "student") {
      Model = Student;
    } else if (type === "admin" || type === "professor") {
      Model = Admin;
    } else {
      return res.status(422).send({ msg: "Invalid user type!" });
    }
    console.log(Model, "model");
    console.log(filter, "user");

    user = await Model.findOne(filter);
    console.log(user, "user");

    if (!user) {
      return res.status(422).send({ msg: "Invalid email or password!" });
    }
    console.log(user._doc, "8333333333");
    user = user._doc;
    delete user.password;

    // JWT token creation
    const payload = { user: user, role: type };
    const secretKey = process.env.JWT_SECRET;

    //setting jwt valid for 24 hours
    const expiresIn = 60 * 60 * 24;

    const token = jwt.sign(payload, secretKey, { expiresIn });
    user.token = token;

    res.status(200).send({ data: user });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong!" });
  }
});

module.exports = router;
