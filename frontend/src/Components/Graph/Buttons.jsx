import React, { useEffect, useState } from 'react';
import { useCustomStates } from '../../CustomStates';
import InfoIcon from '@mui/icons-material/Info';
import { Link } from 'react-router-dom';
import KeyIcon from "@mui/icons-material/Key";
import { getScienceClicks, logScienceAttempt } from '../../clientServerHub';

export const Buttons = ({ matrixUuid, planetColor, planetImg }) => {
  const {
    isRunning,
    selectedPlanet,
    selectedCardIndex,
    handleOpenModal,
    handleLoadCoordinates,
    handleResetCoordinates,
    handleSaveUserView,
    handleSaveDefaultView
  } = useCustomStates();

  const [scienceClicks, setScienceClicks] = useState(null); // null пока не загрузилось

  // Загружаем текущее количество science_clicks при монтировании
  useEffect(() => {
    const fetchScienceClicks = async () => {
      try {
        const result = await getScienceClicks(matrixUuid); // Тот же эндпоинт, но без уменьшения
        if (result && result.science_clicks !== undefined) {
          setScienceClicks(result.science_clicks);
        }
      } catch (error) {
        console.error("Ошибка при получении science_clicks:", error.message);
      }
    };

    fetchScienceClicks();
  }, [matrixUuid]);

  const handleScienceClick = async () => {
    try {
      const result = await logScienceAttempt(matrixUuid);
      // console.log("Science attempt logged:", result);
      if (result && result.science_clicks !== undefined) {
        setScienceClicks(result.science_clicks); // Обновляем из ответа сервера
      }
    } catch (error) {
      console.error("Ошибка:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="buttons-container">
      <ul className="buttons-group" id="pills-tab" role="tablist">
        <li>
          <button id="details-button" className="game-button" onClick={handleOpenModal}>
            <InfoIcon /> Details
          </button>
        </li>

        <li>
          <Link to={`/science/${matrixUuid}`} state={{ selectedPlanet, selectedCardIndex, planetColor, planetImg }}>
            <button
              id="science-button"
              className='game-button'
              onClick={handleScienceClick}
              disabled={scienceClicks !== null && scienceClicks <= 0}
            >
              <p>Science</p>
              {scienceClicks !== null &&
                Array.from({ length: scienceClicks }, (_, index) => (
                  <KeyIcon key={index} sx={{ marginRight: "4px" }} />
                ))
              }
            </button>
          </Link>
        </li>

        {/* Остальные кнопки */}
        <li><button className="game-button">Graph</button></li>
        <li>
          <button className="game-button" disabled={isRunning} title={isRunning ? "Not available during the game" : ""}>
            Profile
          </button>
        </li>
        <li><button className="game-button" onClick={handleSaveUserView}>Save View</button></li>
        <li><button className="game-button" onClick={handleResetCoordinates}>Reset</button></li>
        <li>
          <button className="game-button" onClick={handleLoadCoordinates} title="Загружает последний сохранённый вид графа">
            Load Last View
          </button>
        </li>
        <li>
          <button className='game-button' onClick={handleSaveDefaultView} title='Временная кнопка'>
            Save Graph (Default)
          </button>
        </li>
      </ul>
    </div>
  );
};
