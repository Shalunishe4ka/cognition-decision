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


  return (
    <div className="stopwatch-container" style={{ color: 'white', maxWidth: "250px" }}>
      {/* Время */}
      <div className="stopwatch-container-time" style={{ marginBottom: '15px' }}>
        <h3>Time</h3>
        <p>
          <FaStopwatch />{' '}
          {`${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`}
        </p>
      </div>

      {/* Счёт */}
      <div className="stopwatch-container-score" style={{ marginBottom: '15px' }}>
        <h3>Score</h3>
        <p>
          <FaMedal /> {score}
        </p>
      </div>

      {/* История ходов */}
      <div className="stopwatch-container-table" style={{ marginBottom: '15px' }}>
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

      {/* Кнопки управления */}
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