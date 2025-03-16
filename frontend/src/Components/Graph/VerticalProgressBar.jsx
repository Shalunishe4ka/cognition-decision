import React, { useState, useEffect } from 'react';

const VerticalProgressBar = ({ currentTime, maxTime }) => {
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      const percentage = (currentTime / maxTime) * 100;
      setProgress(percentage > 100 ? 100 : percentage); // Прогресс не может быть больше 100%
    }, [currentTime, maxTime]);
  
    return (
      <div
        style={{
          height: '550px', // Фиксированная высота
          width: '50px',  // Фиксированная ширина
          border: '2px solid white', // Бордер с фиксированной шириной
          borderRadius: '10px', // Скругленные углы бордера
          display: 'flex',
          flexDirection: 'column-reverse', // Заполнение снизу вверх
          justifyContent: 'flex-start', // Прогресс начинает с нижней части
          overflow: 'hidden', // Прогресс не выходит за пределы контейнера
          // backgroundColor: 'rgba(169, 169, 169, 0.8)', // Фон контейнера
          backgroundColor: 'rgba(255, 255, 255, 0.17)'
        }}
      >
        <div
          style={{
            height: `${progress}%`, // Высота зависит от прогресса
            width: '100%',
            // backgroundColor: '#342B41',
            backgroundColor: "rgba(169, 169, 169, 0.8)",
            transition: 'height 0.1s ease', // Плавный переход изменения высоты
          }}
        />
      </div>
    );
  };
  

export default VerticalProgressBar;
