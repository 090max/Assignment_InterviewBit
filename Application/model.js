var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userSchema = new schema(
  {
    emailId: { type: "String" },
    ParticipantType: { type: "String" },
  },
  { collection: "Users" }
);

var interviewScheduleSchema = new schema(
  {
    InterviewId: { type: String },
    Participants: {
      Interviewer: { type: [] },
      Interviewee: { type: [] },
    },
    StartTime: { type: Date },
    EndTime: { type: Date },
  },
  {
    collection: "InterviewSchedule",
  }
);

var participantScheduleSchema = new schema(
  {
    ParticipantId: { type: String },
    InterviewId: { type: Number },
  },
  {
    collection: "ParticipantSchedule",
  }
);

var exportableObject = {
  interviewSchedule: mongoose.model(
    "interviewSchedule",
    interviewScheduleSchema
  ),

  participantSchedule: mongoose.model(
    "participantSchedule",
    participantScheduleSchema
  ),

  users: mongoose.model("users", userSchema),
};

module.exports = exportableObject;
