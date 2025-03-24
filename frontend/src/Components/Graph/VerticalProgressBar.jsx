import React from 'react';
import { useCustomStates } from '../../CustomStates';

const VerticalProgressBar = () => {
  const {
    currentTime, maxTime
  } = useCustomStates();


  const percentage = Math.min((currentTime / maxTime) * 100, 100);

  return (
    <div className="vertical-progress-bar">
      <div
        className="vertical-progress-bar-fill"
        style={{ height: `${percentage}%` }}
      />
    </div>
  );
};

export default VerticalProgressBar;
