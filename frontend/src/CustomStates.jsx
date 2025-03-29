import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import {
  calculateScore,
  getUserUuidFromToken,
  loadDefaultCoordinatesAPI,
  loadUserCoordinatesAPI,
  saveGraphSettingsDefaultAPI,
  saveUserGraphSettingsAPI,
  resetGame,
} from "./clientServerHub"
const CustomStatesContext = createContext();
export const useCustomStates = () => useContext(CustomStatesContext);

export const CustomStatesProvider = ({ children }) => {
  const [graphData, setGraphData] = useState(null);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isRunning, setIsRunning] = useState(false)
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
  const [smallTableData, setSmallTableData] = useState([]);
  const [hugeTableData, setHugeTableData] = useState([]);
  const [syntheticData, setSyntheticData] = useState([]);
  const [isNetworkReady, setIsNetworkReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // [CAT LOGIC] - состояния для "показать кота" и "уже запустили кота"
  const [showCat, setShowCat] = useState(false);
  const [catAnimationLaunched, setCatAnimationLaunched] = useState(false);
  const [isHoveredStart, setIsHoveredStart] = useState(false);
  const [isHoveredStop, setIsHoveredStop] = useState(false);



  // Текущий юзер
  // const [userUuid, setuserUuid] = useState(localStorage.getItem("currentUser") || "defaultUser");
  // Цвет узлов
  const [nodeColor, setNodeColor] = useState("#0e0a20");

  // Для статусов загрузки/ошибок
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Для VerticalProgressBar
  const [currentTime, setCurrentTime] = useState(0);
  // maxTime — допущение, что это время на раунд/уровень
  const maxTime = 600;
  const [progress, setProgress] = useState(0);

  // Пара планетных состояний
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  // ----- Дописанные функции-заглушки -----

  // --- Инициализация userUuid ---
  const [userUuid, setUserUuid] = useState(getUserUuidFromToken());

  const hoverSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const intervalRef = useRef();
  const networkRef = useRef(null);

  const handleClear = () => {
    setSelectedNodes([]);
  };

  const handleMakeMove = async () => {
    try {
      console.log('Делаем ход с вершинами:', selectedNodes);

      if (!graphData || !graphData.nodes) {
        alert("Граф не загружен.");
        return;
      }

      const allNodes = graphData.nodes.get();
      const availableNodesCount = allNodes.filter(node => !disabledNodes.includes(node.id)).length;

      const minRequired = availableNodesCount < 3 ? availableNodesCount : 3;

      if (selectedNodes.length < minRequired) {
        alert(`Для хода необходимо выбрать минимум ${minRequired} вершин.`);
        return;
      }

      // --- Создание словаря выбранных вершин ---
      const selectedNodesDictionary = {};
      selectedNodes.forEach((nodeObj, idx) => {
        const id = typeof nodeObj === 'object' ? nodeObj.id : nodeObj; // берём только id
        selectedNodesDictionary[lastIndex + idx] = id;
      });

      // --- Запрос на сервер ---
      const responseData = await calculateScore(selectedNodesDictionary, matrixInfo.matrix_info.uuid);

      if (!responseData || typeof responseData !== "object") {
        console.error("Некорректный ответ от сервера:", responseData);
        return;
      }

      if (!isRunning) {
        handleStart();
      }

      const { turn_score, total_score } = responseData;

      setMoveHistory(prevHistory => [
        ...prevHistory,
        { selectedNodes: [...selectedNodes], score: turn_score },
      ]);

      const selectedIds = selectedNodes.map(n => (typeof n === 'object' ? n.id : n));
      const moveNodesData = selectedIds.map(id => graphData.nodes.get(id)).filter(Boolean);
      setMovesHistory(prevMoves => [
        ...prevMoves,
        { moveNumber: prevMoves.length + 1, nodes: moveNodesData },
      ]);

      setScore(prevScore =>
        typeof total_score === "number" && !isNaN(total_score) ? total_score : prevScore
      );

      setDisabledNodes(prev => [...new Set([...prev, ...selectedNodes])]);
      setSelectedNodes([]);
      setSelectedEdges([]);

      setLastIndex(prevLastIndex => {
        const maxIndex = Math.max(...Object.keys(selectedNodesDictionary).map(Number));
        return maxIndex + 1;
      });

      setShowHistoryModal(true);

    } catch (error) {
      console.error("Ошибка выполнения хода:", error);
      alert(`Ошибка: ${error.message}`);
    }
  };


  useEffect(() => {
    if (selectedNodes.length > 0) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [selectedNodes]);

  const handleClearEdges = () => {
    selectedEdges.forEach((edgeId) => {
      const edgeObj = graphData.edges.get(edgeId);
      if (edgeObj) {
        graphData.edges.update({
          id: edgeId,
          width: 1,
          color: {
            color: edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
          },
        });
      }
    });
    setSelectedEdges([]);
  };



  // При загрузке компонента — обновим userUuid, если токен сменился
  useEffect(() => {
    const uuidFromToken = getUserUuidFromToken();
    if (uuidFromToken && uuidFromToken !== userUuid) {
      setUserUuid(uuidFromToken);
    }
    // eslint-disable-next-line
  }, []);



  // Если нужна модалка Details
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Примитивный старт/стоп для Stopwatch
  const handleStart = async () => {
    if (intervalRef.current) return; // уже работает

    // Сброс игры на сервере (NEW)
    try {
      if (matrixInfo && matrixInfo.matrix_info?.uuid) {
        await resetGame(matrixInfo.matrix_info.uuid);
      }
    } catch (err) {
      console.warn("Ошибка при сбросе на сервере:", err);
    }

    // Чистим локальные стейты
    setIsRunning(true);
    setCurrentTime(0);
    setScore(0);
    setLastIndex(0);
    setMoveHistory([]);
    setMovesHistory([]);
    setLockedNodes({});
    setDisabledNodes([]); // Очистили, чтобы все вершины снова стали кликабельными

    // Запускаем таймер
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };


  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStopwatchHistory(prev => [
      ...prev,
      {
        currentTime,
        startTime: new Date(),
        selectedNodes: [...moveHistory],
        resscore: score,
      },
    ]);
    setCurrentTime(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  // ==============================
  // Функции для загрузки/сохранения настроек (через uuid)
  // ==============================

  /**
   * Загрузка дефолтных настроек (без пользователя), по uuid.
   */
  const loadDefaultCoordinates = async (uuid) => {
    try {
      const data = await loadDefaultCoordinatesAPI(uuid);
      const payload = Array.isArray(data) ? data[0] : data;
      return payload;
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
      // Если ответ массив, берем первый элемент
      const payload = Array.isArray(data) ? data[0] : data;
      return payload; // { graph_settings, node_coordinates }
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
      console.log(`Дефолтные настройки для uuid: ${uuid} успешно сохранены!`);
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
  const handleSaveDefaultView = async () => {
    if (!matrixInfo?.matrix_info?.uuid) {
      console.warn("UUID матрицы отсутствует");
      return;
    }
    if (!networkRef?.current) {
      console.warn("networkRef.current отсутствует — граф не готов");
      return;
    }
  
    try {
      const nodePositions = networkRef.current.body.nodes;
      const coordinates = Object.fromEntries(
        Object.entries(nodePositions).map(([nodeId, node]) => [
          nodeId,
          { x: node.x, y: node.y },
        ])
      );
  
      const position = networkRef.current.getViewPosition?.() || { x: 0, y: 0 };
      const scale = networkRef.current.getScale?.() || 1;
  
      const dataToSave = {
        graph_settings: { position, scale },
        node_coordinates: coordinates,
      };
  
      await saveGraphSettingsDefaultAPI(matrixInfo.matrix_info.uuid, dataToSave);
      console.log("✅ Дефолтные настройки успешно сохранены!");
    } catch (error) {
      alert(error)
      console.error("❌ Ошибка сохранения дефолтных настроек:", error);
    }
  };
  


  // Функция, которая применяется для обновления графа
  const applyCoordinates = useCallback((data) => {
    console.log(data)
    if (!data || data.error || !networkRef?.current) {
      console.warn("Нет корректных координат для применения:", data);
      return;
    }

    const { graph_settings, node_coordinates } = data;

    if (
      !graph_settings ||
      !node_coordinates ||
      typeof node_coordinates !== 'object'
    ) {
      console.warn("Данные координат неполные или некорректные:", data);
      return;
    }

    const visNetwork = networkRef.current.body;

    Object.entries(node_coordinates).forEach(([nodeId, coords]) => {
      if (visNetwork.nodes[nodeId]) {
        visNetwork.nodes[nodeId].x = coords.x;
        visNetwork.nodes[nodeId].y = coords.y;
      }
    });

    if (graph_settings && networkRef.current.moveTo) {
      networkRef.current.moveTo({
        position: graph_settings.position || { x: 0, y: 0 },
        scale: graph_settings.scale || 1,
        animation: { duration: 1000, easingFunction: "easeInOutQuad" },
      });
    }

    networkRef.current.redraw();
    console.log("Координаты применены!");
  }, [networkRef]);

  return (
    <CustomStatesContext.Provider value={{
      // Состояния
      graphData, setGraphData,
      highlightedNode, setHighlightedNode,
      selectedNodes, setSelectedNodes,
      selectedEdges, setSelectedEdges,
      isRunning, setIsRunning,
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
      userUuid, setUserUuid,
      nodeColor, setNodeColor,
      isLoading, setIsLoading,
      error, setError,
      currentTime, setCurrentTime,
      maxTime, progress, setProgress,
      selectedPlanet, setSelectedPlanet,
      hoveredPlanet, setHoveredPlanet,
      isNetworkReady, setIsNetworkReady,
      smallTableData, setSmallTableData,
      hugeTableData, setHugeTableData,
      syntheticData, setSyntheticData,
      isMenuOpen, setIsMenuOpen,
      showCat, setShowCat,
      catAnimationLaunched, setCatAnimationLaunched,
      isHoveredStart, setIsHoveredStart,
      isHoveredStop, setIsHoveredStop,


      // Рефы
      hoverSoundRef,
      gameOverSoundRef,
      intervalRef,
      networkRef,

      // Допфункции
      handleOpenModal,
      handleStart,
      handleStop,
      handleClear,
      handleMakeMove,
      handleClearEdges,

      // Методы для работы с координатами
      loadDefaultCoordinates,
      loadUserCoordinates,
      handleLoadCoordinates,
      handleResetCoordinates,
      handleSaveUserView,
      handleSaveDefaultView,
      applyCoordinates
    }}>
      {children}
    </CustomStatesContext.Provider>
  )
}
