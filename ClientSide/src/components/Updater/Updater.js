import React, { useState, useEffect } from "react";
import axios from "axios";
import ScheduleInput from "../ScheduleInput/ScheduleInput.js";
const Updater = () => {
  const [interviewId, setInterviewId] = useState("");
  const [data, setData] = useState({
    Interviewer: [],
    Interviewee: [],
    startTime: "",
    endTime: "",
  });

  function handleIdFetch(e) {
    e.preventDefault();
    setInterviewId(e.target[0].value);
  }

  async function getData() {
    var res = await axios.get(
      "http://localhost:8080/getInterviewDetail?InterviewId=" + interviewId
    );

    if (res.data.error) {
      alert(res.data.error);
      return;
    } else setData(res.data.data);
  }

  useEffect(() => {
    if (interviewId != "") {
      getData();
    }
  }, [interviewId]);

  return (
    <div>
      {interviewId == "" || data.startTime == "" ? (
        <div>
          <form className="InterviewIdFetch" onSubmit={handleIdFetch}>
            <input type="text" placeholder="InterviewId" />
            <br />
            <input type="submit" value="submit" />
          </form>
        </div>
      ) : (
        <ScheduleInput updater="1" InterviewId={interviewId} data={data} />
      )}
    </div>
  );
};

export default Updater;
