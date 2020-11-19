var express = require("express");
var app = express();
const path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
mongoose.connect("mongodb://localhost:27017/InterviewBit", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

var PORT = process.env.PORT || 8080;
var db = mongoose.connection;

db.once("open", function () {
  console.log("Database Connection Successful!");
});

db.on("error", console.error.bind(console, "connection error:"));

var schemas = require("./model.js");

var interviewSchedule = schemas.interviewSchedule;
var participantSchedule = schemas.participantSchedule;
var users = schemas.users;

var sendmail = require("./nodemailer.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

// app.get("/", (req, res) => {
//   res.send("Welcome to the server");
// });

function convertToDoubleDigit(v) {
  if (v.length == 1) return "0" + v;
  return v;
}

function getUniqueId() {
  var date = new Date();
  var id =
    date.getFullYear().toString() +
    convertToDoubleDigit((date.getMonth() + 1).toString()) +
    convertToDoubleDigit(date.getDate().toString()) +
    convertToDoubleDigit(date.getHours().toString()) +
    convertToDoubleDigit(date.getMinutes().toString()) +
    convertToDoubleDigit(date.getSeconds().toString());
  return id;
}

function removeParticipantsInterview(removedIntervier, removedInterviewee, id) {
  removedInterviewee.forEach((p1) => {
    participantSchedule
      .deleteOne({ ParticipantId: p1, InterviewId: id })
      .exec((err) => {
        if (err) console.log(err);
      });
  });

  removedIntervier.forEach((p1) => {
    participantSchedule
      .deleteOne({ ParticipantId: p1, InterviewId: id })
      .exec((err) => {
        if (err) console.log(err);
      });
  });
}

function addParticipantToUserTable(email, type) {
  users.find({ emailId: email }).exec((err, data) => {
    if (err) console.log(err);
    else if (data.length == 0) {
      let data1 = new users({
        emailId: email,
        ParticipantType: type,
      });

      data1.save((err) => {
        if (err) console.log(err);
        else console.log("New Participant added ", email);
      });
    }
  });
}
function addParticipantsInterview(interviewer, interviewee, id, data1) {
  interviewer.forEach((elem) => {
    addParticipantToUserTable(elem, "Interviewer");
    let data = new participantSchedule({
      ParticipantId: elem,
      InterviewId: id,
    });
    data.save((err) => {
      if (err) console.log(err);
      else {
        try {
          sendmail(
            elem,
            id,
            data1.Interviewer,
            data1.Interviewee,
            data1.startTime,
            data1.endTime
          );
        } catch (err) {
          console.log(err);
        }
      }
    });
  });

  interviewee.forEach((elem) => {
    addParticipantToUserTable(elem, "Interviewee");
    let data = new participantSchedule({
      ParticipantId: elem,
      InterviewId: id,
    });
    data.save((err) => {
      if (err) console.log(err);
      else {
        try {
          sendmail(
            elem,
            id,
            data1.Interviewer,
            data1.Interviewee,
            data1.startTime,
            data1.endTime
          );
        } catch (err) {
          console.log(err);
        }
      }
    });
  });
}
app.post("/scheduleInterview", (req, res) => {
  var interId = getUniqueId();

  interviewSchedule.find(
    {
      $or: [
        { "Participants.Interviewer": { $in: req.body.Interviewer } },
        { "Participants.Interviewee": { $in: req.body.Interviewee } },
      ],
    },
    (err, data) => {
      if (err) console.log(err);

      var possible = true;
      var conflictingInterviews = [];
      data.forEach((elem) => {
        if (
          new Date(req.body.startTime) > new Date(elem.EndTime) ||
          new Date(req.body.endTime) < new Date(elem.StartTime) ||
          elem.InterviewId == id
        ) {
        } else {
          conflictingInterviews.push(elem.InterviewId);
          possible = false;
        }
      });

      if (possible) {
        let schedule = new interviewSchedule({
          InterviewId: interId,
          Participants: {
            Interviewer: req.body.Interviewer,
            Interviewee: req.body.Interviewee,
          },
          StartTime: req.body.startTime,
          EndTime: req.body.endTime,
        });

        schedule.save((err, data) => {
          if (err) {
            console.log(err);
          } else {
            addParticipantsInterview(
              req.body.Interviewer,
              req.body.Interviewee,
              interId,
              req.body
            );
            res.send({ id: interId, error: "" });
          }
        });
      } else {
        res.send({ error: "overlapping", Interviews: conflictingInterviews });
      }
    }
  );
});

app.get("/getInterviewDetail", (req, res) => {
  id = req.query.InterviewId;
  interviewSchedule.find({ InterviewId: id }).exec((err, data) => {
    if (err) console.log(err);
    else {
      if (data.length != 0) res.send({ data: data[0], error: "" });
      else res.send({ error: "No ID found" });
    }
  });
});

app.put("/updateInterview", (req, res) => {
  id = req.query.InterviewId;

  interviewSchedule.find(
    {
      $or: [
        { "Participants.Interviewer": { $in: req.body.Interviewer } },
        { "Participants.Interviewee": { $in: req.body.Interviewee } },
      ],
    },
    (err, data) => {
      if (err) {
        console.log(err);
        res.send({ error: err });
      }

      var possible = true;
      var conflictingInterviews = [];
      data.forEach((elem) => {
        if (
          new Date(req.body.startTime) > new Date(elem.EndTime) ||
          new Date(req.body.endTime) < new Date(elem.StartTime) ||
          elem.InterviewId == id
        ) {
        } else {
          conflictingInterviews.push(elem.InterviewId);
          possible = false;
        }
      });

      if (possible) {
        interviewSchedule
          .updateOne(
            { InterviewId: id },
            {
              $set: {
                "Participants.Interviewer": req.body.Interviewer,
                "Participants.Interviewee": req.body.Interviewee,
                StartTime: req.body.startTime,
                EndTime: req.body.endTime,
              },
            }
          )
          .exec((err, data) => {
            if (err) console.log(err);
            else {
              if (data.nModified != 0) {
                var removedIntervier = [],
                  removedInterviewee = [],
                  newlyAddedInterviewer = req.body.Interviewer,
                  newlyAddedInterviewee = req.body.Interviewee;
                req.body.prevDetails.Participants.Interviewer.forEach((p1) => {
                  var f = false;
                  req.body.Interviewer.forEach((p2) => {
                    if (p1 == p2) {
                      f = true;
                      newlyAddedInterviewer = newlyAddedInterviewer.filter(
                        (e) => e !== p2
                      );
                    }
                  });

                  if (!f) removedIntervier.push(p1);
                });

                req.body.prevDetails.Participants.Interviewee.forEach((p1) => {
                  var f = false;
                  req.body.Interviewee.forEach((p2) => {
                    if (p1 == p2) {
                      f = true;
                      newlyAddedInterviewee = newlyAddedInterviewee.filter(
                        (e) => e !== p2
                      );
                    }
                  });

                  if (!f) removedInterviewee.push(p1);
                });

                removeParticipantsInterview(
                  removedIntervier,
                  removedInterviewee,
                  id
                );
                addParticipantsInterview(
                  newlyAddedInterviewer,
                  newlyAddedInterviewee,
                  id,
                  req.body
                );
              }
              res.send({ status: "Updated", error: err });
            }
          });
      } else {
        res.send({ error: "overlapping", Interviews: conflictingInterviews });
      }
    }
  );
});

app.get("/upcomingSchedule", (req, res) => {
  var date = new Date().toISOString();
  interviewSchedule.find({ StartTime: { $gt: date } }).exec((err, data1) => {
    if (err) console.log(err);
    res.send({ data: data1, error: err });
  });
});

app.listen(PORT, () => {
  console.log("Listening to ", PORT);
});
