import React from 'react';
import { Button } from 'react-bootstrap';
import { FaStopwatch, FaMedal, FaStar } from 'react-icons/fa';
import { useCustomStates } from './CustomStates';


const Stopwatch = () => {
  const {
    currentTime,
    score,
    maxScorePerMove,
    handleStart,
    handleStop
  } = useCustomStates();

  return (
    <div className="stopwatch-container">
      <h3>Процесс игры</h3>
      <div className="stopwatch-container-time">
        <p><FaStopwatch /> {`Elapsed Time: ${currentTime} seconds`}</p>
      </div>
      <div className="stopwatch-container-score">
        <p><FaMedal /> {`Score: ${score}`}</p>
      </div>
      <div className="stopwatch-container-table">
        <p><FaStar /> {`Max Score Per Move: ${maxScorePerMove}`}</p>
        {/* Можешь сюда таблицу ходов вставлять и т.д. */}
      </div>
      <div className="stopwatch-container-buttons">
        <Button variant="success" onClick={handleStart}>
          Start
        </Button>
        <Button variant="danger" onClick={handleStop}>
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;
