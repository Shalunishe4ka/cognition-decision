import React from 'react'
import { useCustomStates } from './CustomStates'
import InfoIcon from '@mui/icons-material/Info'
import { Link } from 'react-router-dom'

export const Buttons = () => {
  const {
    // Состояния
    isRunning,
    selectedPlanet,
    selectedCardIndex,
    // Методы (заглушки в useCustomStates)
    handleOpenModal,
    handleLoadCoordinates,
    handleResetCoordinates,
    handleSaveUserView,
  } = useCustomStates();

  // UUID может приходить и пропами, или из localStorage
  const uuid = localStorage.getItem("currentMatrixUUID") || "test-uuid";

  // При клике загружаем и применяем
  const applyCoordinates = (data) => {
    // ЗДЕСЬ нужна логика применения координат к networkRef
    // Если networkRef виден только в GraphComponent — прокинь эту функцию туда.
    console.log("Apply coords:", data);
  };

  const saveGraphSettings = async () => {
    const settingsToSave = {
      graph_settings: {
        position: { x: 100, y: 200 },
        scale: 1.2,
      },
      node_coordinates: {
        1: { x: 10, y: 10 },
        2: { x: 55, y: 40 },
      },
    };
    await handleSaveUserView(uuid, settingsToSave);
    alert("Пользовательские настройки успешно сохранены!");
  };

  const loadUserCoordinatesClick = async () => {
    await handleLoadCoordinates(uuid, applyCoordinates);
  };

  const resetNodeCoordinates = async () => {
    await handleResetCoordinates(uuid, applyCoordinates);
  };

  return (
    <div className="buttons-container">
      <ul className="buttons-group" id="pills-tab" role="tablist">
        <li>
          <button
            className="game-button"
            onClick={handleOpenModal}
          >
            <InfoIcon /> Details
          </button>
        </li>
        <li>
          <Link to="/science" state={{ selectedPlanet, selectedCardIndex }}>
            <button
              className="game-button"
              disabled={isRunning}
              title={isRunning ? "Not available during the game" : ""}
            >
              Science
            </button>
          </Link>
        </li>
        <li>
          <button className="game-button">
            Graph
          </button>
        </li>
        <li>
          <button
            className="game-button"
            disabled={isRunning}
            title={isRunning ? "Not available during the game" : ""}
          >
            Profile
          </button>
        </li>
        <li>
          <button className="game-button" onClick={saveGraphSettings}>
            Save View
          </button>
        </li>
        <li>
          <button className="game-button" onClick={resetNodeCoordinates}>
            Reset
          </button>
        </li>
        <li>
          <button
            className="game-button"
            onClick={loadUserCoordinatesClick}
            title="Загружает последний сохранённый вид графа"
          >
            Load Last View
          </button>
        </li>
      </ul>
    </div>
  )
}
