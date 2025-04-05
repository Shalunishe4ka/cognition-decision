import React from 'react';
import { FaStopwatch, FaMedal } from 'react-icons/fa';
import { useCustomStates } from '../../CustomStates';

const Stopwatch = ({ planetColor }) => {
  const {
    currentTime,
    score,
    movesHistory,
    handleStart,
    handleStop,
    isRunning,
    isHoveredStart,
    setIsHoveredStart,
    isHoveredStop,
    setIsHoveredStop,
  } = useCustomStates();


  const elapsedTime = currentTime; // Переименуем для читабельности

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
          <FaMedal /> {score.toFixed(2)}
        </p>
      </div>

      <div className="stopwatch-container-table">
        <h3>Vertices</h3>
        {movesHistory.length > 0 ? (
          <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
            {movesHistory.map((move) => (
              <li key={move.moveNumber} style={{ marginBottom: '10px' }}>
                <strong>Move {move.moveNumber}:</strong> {move.nodes.map(node => node?.id ?? 'N/A').join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <p>No moves made yet</p>
        )}
      </div>


      <div className="stopwatch-container-buttons">
        <button
          style={{
            backgroundColor: isRunning ? "gray" : (isHoveredStart ? 'transparent' : planetColor),
            border: `1px solid ${isRunning ? "gray" : planetColor}`,
            cursor: isRunning ? "not-allowed" : "pointer",
            color: isHoveredStart ? planetColor : "black"
          }}
          className='btn-start'
          onMouseEnter={() => setIsHoveredStart(true)}
          onMouseLeave={() => setIsHoveredStart(false)}
          disabled={isRunning}
          onClick={handleStart}
          title={isRunning ? "Вы уже в процессе игры!" : "Начать игру"}

        >
          Start
        </button>
        <button
          onMouseEnter={() => setIsHoveredStop(true)}
          onMouseLeave={() => setIsHoveredStop(false)}
          style={{
            backgroundColor: isRunning ? (isHoveredStop ? 'transparent' : 'rgb(255, 105, 105)') : 'gray',
            border: `1px solid ${isRunning ? (isHoveredStop ? planetColor : "rgb(255, 105, 105)") : 'gray'}`,
            cursor: isRunning ? "pointer" : "not-allowed",
            color: isHoveredStop ? planetColor : "black"

          }}
          disabled={!isRunning}
          onClick={handleStop}
          title={isRunning ? "Остановить игру" : "Вы ещё не начали игру!"}
          className='btn-stop'
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;
