const mongoose = require("mongoose");
const validator = require("email-validator");

const that = {};

that.isValidEmail = (email) => {
  return validator.validate(email);
};

that.isValidString = (string) => {
  return typeof string === "string" && string.length > 0;
};

that.isValidInteger = (numberString) => {
  return Number.isInteger(Number(numberString));
};

that.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = that;
