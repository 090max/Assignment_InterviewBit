import React, { useState, useEffect } from "react";
import axios from "axios";

const Upcoming = () => {
  const [data, setData] = useState([]);

  async function getData() {
    var ans = await axios.get("http://localhost:8080/upcomingSchedule");
    if (ans.data.error) alert(ans.data.error);
    else if (ans.data.length != 0) setData(ans.data.data);
  }

  useEffect(() => {
    getData();
  }, []);

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

  return (
    <div>
      {data.length != 0 ? (
        <div className="Upcoming_content">
          {data.map((row) => (
            <div className="content_box">
              <label>{"InterviewId : "} </label> {row.InterviewId}
              <br />
              <label>{"Interviewer : "} </label>{" "}
              {row.Participants.Interviewer.join(" , ")}
              <br />
              <label>{"Interviewee : "} </label>{" "}
              {row.Participants.Interviewee.join(" , ")}
              <br />
              <label>{"StartTime : "} </label> {getDateText(row.StartTime)}
              <br />
              <label>{"EndTime : "} </label> {getDateText(row.EndTime)}
              <br />
              <br />
            </div>
          ))}
        </div>
      ) : (
        <h1>No Upcoming Interviews</h1>
      )}
    </div>
  );
};

export default Upcoming;
