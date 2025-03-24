import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaStopwatch, FaMedal } from 'react-icons/fa';
import { useCustomStates } from '../../CustomStates';

export const StopWatchContainer = ({ planetColor }) => {
  const {
    currentTime,
    score,
    movesHistory,
    handleStart,
    handleStop,
    isRunning,
  } = useCustomStates();

  const [isHovered, setIsHovered] = useState(false);
  const elapsedTime = currentTime;

  const startButtonStyle = {
    backgroundColor: isHovered ? 'limegreen' : planetColor,
    color: 'white',
    border: 'none',
    marginRight: '10px',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div className="stopwatch-container" style={{ color: 'white', maxWidth: "250px" }}>
      {/* Время */}
      <div className="stopwatch-container-time" style={{ marginBottom: '15px' }}>
        <h3>Time</h3>
        <p>
          <FaStopwatch />{' '}
          {`${String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:${String(elapsedTime % 60).padStart(2, '0')}`}
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
                <strong>Move {move.moveNumber}:</strong> {move.nodes.join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <p>No moves made yet</p>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="stopwatch-container-buttons">
        <Button
          style={startButtonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isRunning}
          onClick={handleStart}
          title={isRunning ? 'Вы уже в процессе игры!' : 'Начать игру'}
        >
          Start
        </Button>

        <Button
          variant="danger"
          disabled={!isRunning}
          onClick={handleStop}
          title={isRunning ? 'Остановить игру' : 'Вы ещё не начали игру!'}
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

