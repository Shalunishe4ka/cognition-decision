import React from 'react'
import { useCustomStates } from './CustomStates'
import InfoIcon from '@mui/icons-material/Info'
import { Link } from 'react-router-dom'

export const Buttons = ({ 
  matrixUuid,
  networkRef,
  applyCoordinates
}) => {
  const {
    isRunning,
    selectedPlanet,
    selectedCardIndex,
    handleOpenModal,
    handleLoadCoordinates,
    handleResetCoordinates,
    handleSaveUserView,
    userUuid,
  } = useCustomStates();

  // --- Продвинутая логика сохранения ---
  const saveGraphSettings = async () => {
    if (!networkRef?.current) {
      console.log("Граф не инициализирован (networkRef.current отсутствует).");
      return;
    }

    // Собираем все узлы из Vis.js
    const nodePositions = networkRef.current.body.nodes;
    const coordinates = {};
    for (const [nodeId, node] of Object.entries(nodePositions)) {
      coordinates[nodeId] = { x: node.x, y: node.y };
    }

    try {
      // Vis.js методы для получения текущего положения и масштаба:
      const position = networkRef.current.getViewPosition?.() || { x: 0, y: 0 };
      const scale = networkRef.current.getScale?.() || 1;

      // Формируем итоговый объект
      const dataToSave = {
        graph_settings: { position, scale },
        node_coordinates: coordinates,
      };

      // Далее вызываем handleSaveUserView из useCustomStates,
      // который уже умеет отправлять запрос на сервер
      await handleSaveUserView(matrixUuid, dataToSave);

      // alert("Пользовательские настройки успешно сохранены!");
      console.log("Saving graph settings for userUuid:", userUuid);

    } catch (error) {
      console.error("Ошибка при сохранении пользовательских настроек:", error);
    }
  };

  // --- Загрузка пользовательских настроек ---
  const loadUserCoordinatesClick = async () => {
    await handleLoadCoordinates(matrixUuid, applyCoordinates);
  };

  // --- Сброс на дефолт ---
  const resetNodeCoordinates = async () => {
    await handleResetCoordinates(matrixUuid, applyCoordinates);
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

        {/* Кнопка Save – собираем реальную позицию и масштаб из networkRef */}
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
