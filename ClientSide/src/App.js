import logo from "./logo.svg";
import "./App.css";
import Scheduler from "./components/Scheduler/Scheduler.js";
import Updater from "./components/Updater/Updater.js";
import Upcoming from "./components/Upcoming/Upcoming.js";

import { useState } from "react";
function App() {
  const [val, setVal] = useState(0);

  function handleButton(id) {
    console.log(id);
    setVal(id);
  }
  return (
    <div className="outerFrame">
      <div className="content">
        {val == 0 ? <Scheduler /> : ""}
        {val == 1 ? <Upcoming /> : ""}
        {val == 2 ? <Updater /> : ""}
      </div>
      <div className="buttons">
        <button
          onClick={() => {
            handleButton(0);
          }}
        >
          Schedule
        </button>
        <button
          onClick={() => {
            handleButton(1);
          }}
        >
          Get status
        </button>
        <button
          onClick={() => {
            handleButton(2);
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default App;
