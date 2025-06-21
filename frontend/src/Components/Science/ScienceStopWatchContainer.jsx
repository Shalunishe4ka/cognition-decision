import React from 'react';
import { FaStopwatch, FaMedal } from 'react-icons/fa';
import { useCustomStates } from '../../CustomStates';

export const ScienceStopWatchContainer = ({ planetColor }) => {
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

  const formattedTime = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;

  return (
    <div className="science-stopwatch-container">
      {/* Время */}
      <div className="science-stopwatch-container-time">
        <h3>Time</h3>
        <p><FaStopwatch /> {formattedTime}</p>
      </div>

      {/* Счёт */}
      <div className="science-stopwatch-container-score">
        <h3>Score</h3>
        <p><FaMedal /> {score}</p>
      </div>

      {/* История ходов */}
      <div className="science-stopwatch-container-table" style={{ overflowY: 'auto' }}>
        <h3>Vertices</h3>
        {movesHistory.length > 0 ? (
          <ul className="selected-list" style={{ padding: 0, margin: 0 }}>
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

      {/* Кнопки */}
      <div className="science-stopwatch-container-buttons">
        <button
          className="btn-start"
          style={{
            backgroundColor: isRunning ? "gray" : (isHoveredStart ? 'transparent' : planetColor),
            border: `1px solid ${isRunning ? "gray" : planetColor}`,
            color: isHoveredStart ? planetColor : "black",
            cursor: isRunning ? "not-allowed" : "pointer"
          }}
          onMouseEnter={() => setIsHoveredStart(true)}
          onMouseLeave={() => setIsHoveredStart(false)}
          onClick={handleStart}
          disabled={isRunning}
          title={isRunning ? "You are already in the game!" : "Start the game"}
        >
          Start
        </button>

        <button
          className="btn-stop"
          style={{
            backgroundColor: isRunning ? (isHoveredStop ? 'transparent' : 'rgb(255, 105, 105)') : 'gray',
            border: `1px solid ${isRunning ? (isHoveredStop ? planetColor : "rgb(255, 105, 105)") : 'gray'}`,
            color: isHoveredStop ? planetColor : "black",
            cursor: isRunning ? "pointer" : "not-allowed"
          }}
          onMouseEnter={() => setIsHoveredStop(true)}
          onMouseLeave={() => setIsHoveredStop(false)}
          onClick={handleStop}
          disabled={!isRunning}
          title={isRunning ? "Stop the game" : "You haven't started the game yet!"}
        >
          Stop
        </button>
      </div>
    </div>
  );
};
