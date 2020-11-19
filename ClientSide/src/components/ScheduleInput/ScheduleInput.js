import React, { useState, useEffect } from "react";
import axios from "axios";

const ScheduleInput = (props) => {
  function emailRegex(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function verifyEmail(email) {
    var emailArr = email.split(",");
    var ok = true;
    emailArr.forEach((element) => {
      if (!emailRegex(element)) ok = false;
    });
    return ok;
  }

  function convertToDoubleDigit(v) {
    if (v.length == 1) return "0" + v;
    return v;
  }

  function getTextDay(date) {
    if (!date) return date;
    date = new Date(date);
    return (
      date.getFullYear().toString() +
      "-" +
      (date.getMonth() + 1).toString() +
      "-" +
      date.getDate().toString()
    );
  }

  function getTextTime(date) {
    if (!date) return date;
    date = new Date(date);

    return (
      convertToDoubleDigit(date.getHours().toString()) +
      ":" +
      convertToDoubleDigit(date.getMinutes().toString())
    );
  }

  function checkDate(date) {
    if (date.split("-").length != 3) return false;
    return true;
  }

  function checkTime(time) {
    if (time.split(":").length != 2) return false;
    return true;
  }

  function checkDateTime(date) {}

  function separate(arr) {
    return arr.join(",");
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (verifyEmail(e.target[0].value) == 0) {
      alert("Please Check the Intervier email");
      return;
    }

    if (verifyEmail(e.target[1].value) == 0) {
      alert("Please Check the Interviewee email");
      return;
    }

    if (!checkDate(e.target[2].value)) {
      alert("Please check the Start Date format YYYY-MM-DD");
      return;
    }

    if (!checkTime(e.target[3].value)) {
      alert("Please check the Start Time format HH:MM");
      return;
    }

    if (!checkDate(e.target[4].value)) {
      alert("Please check the End Date format YYYY-MM-DD");
      return;
    }

    if (!checkTime(e.target[5].value)) {
      alert("Please check the End Time format HH:MM");
      return;
    }

    Date.prototype.isValid = function () {
      return this.getTime() === this.getTime();
    };
    var startObject = new Date(e.target[2].value + " " + e.target[3].value);
    if (!startObject.isValid()) {
      alert("Invalid Start Date Time");
      return;
    }
    var endObject = new Date(e.target[4].value + " " + e.target[5].value);
    if (!endObject.isValid()) {
      alert("Invalid End Date Time");
      return;
    }

    if (endObject < startObject) {
      alert("Start Time should be less than end time");
      return;
    }

    if (startObject < new Date()) {
      alert("The start Time should be greater than the current time");
      return;
    }

    if (props.updater == 1) {
      let data = {
        Interviewer: e.target[0].value.split(","),
        Interviewee: e.target[1].value.split(","),
        startTime: startObject,
        endTime: endObject,
        prevDetails: props.data,
      };

      var ans = await axios.put(
        "http://localhost:8080/updateInterview?InterviewId=" +
          props.InterviewId,
        data
      );
      if (ans.data.error) {
        if (ans.data.error == "overlapping") {
          alert("Overlapping with " + ans.data.Interviews);
        } else alert(ans.data.error);
      } else {
        alert("Update success !");
      }
    } else {
      let data = {
        Interviewer: e.target[0].value.split(","),
        Interviewee: e.target[1].value.split(","),
        startTime: startObject,
        endTime: endObject,
      };

      var ans = await axios.post(
        "http://localhost:8080/scheduleInterview",
        data
      );

      if (ans.data.error) {
        if (ans.data.error == "overlapping") {
          alert("Overlapping with " + ans.data.Interviews.toString());
        } else alert(ans.data.error);
      } else {
        console.log(ans.data);
        alert("Interview Scheduled id " + ans.data.id.toString());
      }
    }
  }

  return (
    <div className="">
      {props.updater == 0 && !props.hasOwnProperty("data") ? (
        <form className="schedulerForm" onSubmit={handleFormSubmit}>
          <input type="text" placeholder="Enter Interviewer email" required />
          <br />
          <input type="text" placeholder="Enter Interviewee email" required />
          <br />
          <label>Choose start time for interview</label>
          <br />
          <label>Enter Date</label>
          <input type="text" placeholder="YYYY-MM-DD" required />
          <label>Enter Time</label>
          <input type="time" name="time" min="00:00" max="23:59" />
          <br />

          <label>Choose end time for interview</label>
          <br />
          <label>Enter Date</label>
          <input type="text" placeholder="YYYY-MM-DD" required />
          <label>Enter Time</label>
          <input type="time" name="time" min="00:00" max="23:59" />
          <br />
          <input type="submit" value="Submit"></input>
        </form>
      ) : (
        <form className="schedulerForm" onSubmit={handleFormSubmit}>
          <input
            type="text"
            defaultValue={separate(props.data.Participants.Interviewer)}
            required
          />
          <br />
          <input
            type="text"
            defaultValue={separate(props.data.Participants.Interviewee)}
            required
          />
          <br />
          <label>Choose start time for interview</label>
          <br />
          <label>Enter Date</label>
          <input
            type="text"
            defaultValue={getTextDay(props.data.StartTime)}
            required
          />
          <label>Enter Time</label>
          <input
            type="time"
            name="time"
            defaultValue={getTextTime(props.data.StartTime).toString()}
            min="00:00"
            max="23:59"
          />
          <br />

          <label>Choose end time for interview</label>
          <br />
          <label>Enter Date</label>
          <input
            type="text"
            defaultValue={getTextDay(props.data.EndTime)}
            required
          />
          <label>Enter Time</label>
          <input
            type="time"
            name="time"
            defaultValue={getTextTime(props.data.EndTime).toString()}
            min="00:00"
            max="23:59"
          />
          <br />
          <input type="submit" value="Update"></input>
        </form>
      )}
    </div>
  );
};

export default ScheduleInput;
