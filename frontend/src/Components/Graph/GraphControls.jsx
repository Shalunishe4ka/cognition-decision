// GraphControls.jsx
import React from "react";
import { FaMedal, FaStopwatch, FaCog } from "react-icons/fa";

export default function GraphControls({
  elapsedTime,
  score,
  onStart,
  onStop,
  isRunning,
  openSettings
}) {
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
  const seconds = String(elapsedTime % 60).padStart(2, "0");

  return (
    <div className="graph-controls">
      <div className="graph-controls-timer">
        <div><FaStopwatch /> {minutes}:{seconds}</div>
        <div><FaMedal /> {score}</div>
      </div>
      <div className="graph-controls-buttons">
        <button onClick={onStart} disabled={isRunning}>Start</button>
        <button onClick={onStop} disabled={!isRunning}>Stop</button>
        <button onClick={openSettings}><FaCog /> Settings</button>
      </div>
    </div>
  );
}
