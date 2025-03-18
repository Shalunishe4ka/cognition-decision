import { useState } from 'react'
import {
  loadDefaultCoordinatesAPI,
  loadUserCoordinatesAPI,
  saveGraphSettingsDefaultAPI,
  saveUserGraphSettingsAPI,
} from "../Solar/ModalWindowCards/clientServerHub"

export const useCustomStates = () => {
  const [graphData, setGraphData] = useState(null);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stopwatchHistory, setStopwatchHistory] = useState([]);
  const [showNodeList, setShowNodeList] = useState(false);
  const [lockedNodes, setLockedNodes] = useState({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastIndex, setLastIndex] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [serverResponseData, setServerResponseData] = useState(null);
  const [score, setScore] = useState(0);
  const [maxScorePerMove, setMaxScorePerMove] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [movesHistory, setMovesHistory] = useState([]);
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [matrixInfo, setMatrixInfo] = useState({});
  const [positiveEdgeColor, setPositiveEdgeColor] = useState("#00FF00");
  const [negativeEdgeColor, setNegativeEdgeColor] = useState("#FF0000");
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [nodeSize, setNodeSize] = useState(40);
  const [edgeRoundness, setEdgeRoundness] = useState(0.15);

  // Текущий юзер
  const [userUuid, setuserUuid] = useState(localStorage.getItem("currentUser") || "defaultUser");
  // Цвет узлов
  const [nodeColor, setNodeColor] = useState("#0b001a");

  // Для статусов загрузки/ошибок
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Для VerticalProgressBar
  const [currentTime, setCurrentTime] = useState(0);
  // maxTime — допущение, что это время на раунд/уровень
  const [maxTime, setMaxTime] = useState(600);
  const [progress, setProgress] = useState(0);

  // Пара планетных состояний
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  // ----- Дописанные функции-заглушки -----

  // Если нужна модалка Details
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Примитивный старт/стоп для Stopwatch
  const handleStart = () => {
    setIsRunning(true);
    // Логику таймера можно делать через useEffect + setInterval
  };
  const handleStop = () => {
    setIsRunning(false);
  };

  // ==============================
  // Функции для загрузки/сохранения настроек (через uuid)
  // ==============================

  /**
   * Загрузка дефолтных настроек (без пользователя), по uuid.
   */
  const loadDefaultCoordinates = async (uuid) => {
    try {
      const data = await loadDefaultCoordinatesAPI(uuid);
      return data; // { graph_settings, node_coordinates }
    } catch (error) {
      console.error("Ошибка при загрузке дефолтных настроек:", error);
      return null;
    }
  };

  /**
   * Загрузка пользовательских настроек (для конкретного userUuid), по uuid.
   */
  const loadUserCoordinates = async (uuid) => {
    try {
      const data = await loadUserCoordinatesAPI(uuid, userUuid);
      return data; // { graph_settings, node_coordinates }
    } catch (error) {
      console.error("Ошибка загрузки пользовательских настроек:", error);
      return null;
    }
  };

  /**
   * Сохранение (дефолтных) настроек графа по uuid.
   */

  const saveGraphSettingsDefault = async (uuid, settings) => {
    try {
      await saveGraphSettingsDefaultAPI(uuid, settings);
      console.log("Дефолтные настройки успешно сохранены!");
    } catch (error) {
      console.error("Ошибка сохранения дефолтных настроек:", error);
    }
  };

  /**
   * Сохранение пользовательских настроек (userUuid) по uuid.
   */
  const saveUserGraphSettings = async (uuid, settings) => {
    try {
      await saveUserGraphSettingsAPI(uuid, userUuid, settings);
      console.log("Пользовательские настройки успешно сохранены!");
    } catch (error) {
      console.error("Ошибка сохранения пользовательских настроек:", error);
    }
  };

  // ==============================
  // Методы для работы с координатами через кнопки
  // ==============================

  // 1. Загрузить (если есть userSettings — берём их, иначе default)
  const handleLoadCoordinates = async (uuid, applyCoordinatesFn) => {
    const userData = await loadUserCoordinates(uuid);
    if (userData) {
      console.log("Загружены пользовательские настройки");
      applyCoordinatesFn(userData);
    } else {
      console.warn("Пользовательских настроек нет, грузим дефолтные...");
      const defaultData = await loadDefaultCoordinates(uuid);
      if (defaultData) {
        console.log("Загружены дефолтные настройки");
        applyCoordinatesFn(defaultData);
      } else {
        console.warn("И дефолтных тоже нет. Нечего грузить.");
      }
    }
  };


  // 2. Сброс (принудительно дефолт)
  const handleResetCoordinates = async (uuid, applyCoordinatesFn) => {
    const defaultData = await loadDefaultCoordinates(uuid);
    if (defaultData) {
      applyCoordinatesFn(defaultData);
      alert("Дефолтные настройки графа загружены.");
    } else {
      alert("Дефолтные настройки графа не найдены.");
    }
  };

  // 3. Сохранить пользовательские
  const handleSaveUserView = async (uuid, settings) => {
    await saveUserGraphSettings(uuid, settings);
  };

  // 4. Сохранить дефолтные
  const handleSaveDefaultView = async (uuid, settings) => {
    await saveGraphSettingsDefault(uuid, settings);
  };

  return {
    // Состояния
    graphData, setGraphData,
    highlightedNode, setHighlightedNode,
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
    isRunning, setIsRunning,
    elapsedTime, setElapsedTime,
    stopwatchHistory, setStopwatchHistory,
    showNodeList, setShowNodeList,
    lockedNodes, setLockedNodes,
    showHistoryModal, setShowHistoryModal,
    moveHistory, setMoveHistory,
    lastIndex, setLastIndex,
    hoveredNode, setHoveredNode,
    cursorPosition, setCursorPosition,
    showModal, setShowModal,
    serverResponseData, setServerResponseData,
    score, setScore,
    maxScorePerMove, setMaxScorePerMove,
    isClosing, setIsClosing,
    showGameOverModal, setShowGameOverModal,
    movesHistory, setMovesHistory,
    disabledNodes, setDisabledNodes,
    matrixInfo, setMatrixInfo,
    positiveEdgeColor, setPositiveEdgeColor,
    negativeEdgeColor, setNegativeEdgeColor,
    physicsEnabled, setPhysicsEnabled,
    nodeSize, setNodeSize,
    edgeRoundness, setEdgeRoundness,
    userUuid, setuserUuid,
    nodeColor, setNodeColor,
    isLoading, setIsLoading,
    error, setError,
    currentTime, setCurrentTime,
    maxTime, setMaxTime,
    progress, setProgress,
    selectedPlanet, setSelectedPlanet,
    hoveredPlanet, setHoveredPlanet,

    // Допфункции
    handleOpenModal,
    handleStart,
    handleStop,

    // Методы для работы с координатами
    loadDefaultCoordinates,
    loadUserCoordinates,
    handleLoadCoordinates,
    handleResetCoordinates,
    handleSaveUserView,
    handleSaveDefaultView,
  }
}
