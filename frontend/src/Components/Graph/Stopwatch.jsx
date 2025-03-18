// Stopwatch.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { FaStopwatch, FaMedal, FaStar } from 'react-icons/fa';
import { useCustomStates } from './CustomStates';
import "./Styles/Stopwatch.css"

const Stopwatch = () => {

  const {
    elapsedTime, score, maxScorePerMove, handleStart, handleStop
  } = useCustomStates();

  return (
    <div className="stopwatch-container">
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
        </Button>
        <Button variant="danger" onClick={handleStop}>
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;
