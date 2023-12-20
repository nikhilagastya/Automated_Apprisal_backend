const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  designation: String,
  department: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("User", userSchema);
