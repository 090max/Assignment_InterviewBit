const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "interviewschedule090@gmail.com",
    pass: "Interview#123",
  },
});

module.exports = transporter;
