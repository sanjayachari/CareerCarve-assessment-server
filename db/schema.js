const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  fullName: String,
  email: String,
  expertise: String,
  password: String,
  userType: String,
  events: Array,
});

const exportSchema = mongoose.model("users", Schema);

module.exports = exportSchema;
