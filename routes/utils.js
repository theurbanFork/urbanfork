const validator = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const xss = require("xss");
const User = require("../models/userModel");

function sanitizeInput(value) {
  var sanitizedValue = xss(value);
  sanitizedValue = sanitizeHtml(sanitizedValue, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return sanitizedValue;
}

function checkUser(id) {
  const user = User.findById(id);
  if (user) {
    return true;
  } else {
    return false;
  }
}

module.exports = { sanitizeInput, checkUser };
