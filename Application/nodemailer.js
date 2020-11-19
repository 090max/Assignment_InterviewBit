const transporter = require("./nodemailer_config.js");

function getDateText(date) {
  var d = new Date(date);

  return (
    d.getFullYear().toString() +
    "-" +
    (d.getMonth() + 1).toString() +
    "-" +
    d.getDate() +
    " " +
    d.getHours().toString() +
    ":" +
    d.getMinutes().toString()
  );
}

function make_body(interviewId, Interviewer, Interviewee, StartTime, endTime) {
  body =
    "Your Interview id is " +
    interviewId +
    " \n " +
    "Interviewer :" +
    Interviewer +
    " \n" +
    " Interviewee " +
    Interviewee +
    " \n " +
    "Start Time " +
    getDateText(StartTime) +
    " \n " +
    "End Time : " +
    getDateText(endTime);

  return body;
}
async function sendmail(
  to,
  interviewId,
  Interviewer,
  Interviewee,
  StartTime,
  endTime
) {
  const mailOptions = {
    from: "interviewschedule090@gmail.com",
    to: to,
    subject: "Interview Scheduled",
    text: make_body(interviewId, Interviewer, Interviewee, StartTime, endTime),
  };

  await transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
}

// sendmail(1, "090max@gmail.com", "Hello", "Hello");
module.exports = sendmail;
