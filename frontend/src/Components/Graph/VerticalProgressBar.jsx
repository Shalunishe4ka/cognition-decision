import React, { useEffect } from 'react';
import { useCustomStates } from './CustomStates';

const VerticalProgressBar = () => {
  const {
    currentTime, maxTime, progress, setProgress
  } = useCustomStates();

  useEffect(() => {
    const percentage = (currentTime / maxTime) * 100;
    setProgress(percentage > 100 ? 100 : percentage);
  }, [currentTime, maxTime, setProgress]);

  return (
    <div className="vertical-progress-bar">
      <div
        className="vertical-progress-bar-fill"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
};

export default VerticalProgressBar;
