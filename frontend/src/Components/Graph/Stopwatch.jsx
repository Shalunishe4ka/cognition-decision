import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaStopwatch, FaMedal } from 'react-icons/fa';
import { useCustomStates } from './CustomStates';

const Stopwatch = () => {
  const {
    currentTime,
    score,
    movesHistory,
    handleStart,
    handleStop,
    isRunning,
    disabledNodes,
  } = useCustomStates();

  const [isHovered, setIsHovered] = useState(false);

  const elapsedTime = currentTime; // Переименуем для читабельности
  const buttonStyle = {
    backgroundColor: isHovered ? 'limegreen' : 'green',
    color: 'white',
    border: 'none',
    marginRight: '10px',
  };

  return (
    <div
      className="stopwatch-container"
      style={{
        color: "white",
      }}
    >
      <div className="stopwatch-container-time">
        <h3>Time</h3>
        <p>
          <FaStopwatch />{" "}
          {`${String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:${String(elapsedTime % 60).padStart(2, "0")}`}
        </p>
      </div>

      <div className="stopwatch-container-score">
        <h3>Score</h3>
        <p>
          <FaMedal /> {score}
        </p>
      </div>

      <div className="stopwatch-container-table">
        <h1>Vertices</h1>
        {movesHistory.length > 0 ? (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {movesHistory.map((move) => (
              <li key={move.moveNumber} style={{ marginBottom: "10px" }}>
                <strong>Move {move.moveNumber}:</strong> {move.nodes.join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <p>No moves made yet</p>
        )}
      </div>


      <div className="stopwatch-container-buttons">
        <Button
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isRunning}
          onClick={handleStart}
          title={isRunning ? "Вы уже в процессе игры!" : "Начать игру"}

        >
          Start
        </Button>
        <Button
          variant="danger"
          disabled={!isRunning}
          onClick={handleStop}
          title={isRunning ? "Остановить игру" : "Вы ещё не начали игру!"}
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;
