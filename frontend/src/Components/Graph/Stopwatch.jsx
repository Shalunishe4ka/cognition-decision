// Stopwatch.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { FaStopwatch, FaMedal, FaStar } from 'react-icons/fa';

const Stopwatch = ({ elapsedTime, score, maxScorePerMove, handleStart, handleStop }) => {
  return (
    <div className="stopwatch-container" style={{ right: 75, position: 'absolute', zIndex: 1 }}>
      <h3>Процесс игры</h3>
      <div>
        <div>
          <p><FaStopwatch />{`Elapsed Time: ${elapsedTime} seconds`}</p>
          <p><FaMedal /> {`Score: ${score}`}</p>
          <p><FaStar /> {`Max Score Per Move: ${maxScorePerMove}`}</p>
        </div>
      </div>
      <div>
        <Button variant="success" onClick={handleStart}>
          Start
        </Button>{' '}
        <Button variant="danger" onClick={handleStop}>
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;
