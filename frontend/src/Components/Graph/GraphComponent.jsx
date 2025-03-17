import React, { useState, useEffect, useRef } from "react";
import GraphCanvas from "./GraphCanvas";
import MovesSidebar from "./MovesSidebar";
import GraphSettingsModal from "./GraphSettingsModal";
import VerticalProgressBar from "./VerticalProgressBar";
import Stopwatch from "./Stopwatch";
import CatAnimation from "./CatAnimation";
import { cardcreds, cards } from "../Solar/ModalWindowCards/cards";

export default function GraphComponent({
  matrixInfo,
  backgroundColor = "#0b001a",
  positiveEdgeColor = "#00FF00",
  negativeEdgeColor = "#FF0000",
  nodeColor = "#97C2FC",
  physicsEnabled = false,
  nodeSize = 40,
  edgeRoundness = 0.15,
  selectedPlanet,
  selectedCardIndex
}) {
  // Состояния
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [movesHistory, setMovesHistory] = useState([]);
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [showCat, setShowCat] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stopwatchHistory, setStopwatchHistory] = useState([]);
  const [lockedNodes, setLockedNodes] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastIndex, setLastIndex] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("currentUser") || "defaultUser");
  const [showNodeList, setShowNodeList] = useState(false);

  // Звуковые эффекты
  const hoverSoundRef = useRef();
  const gameOverSoundRef = useRef();
  const intervalRef = useRef();

  // Логика таймера
  useEffect(() => {
    const timer = isRunning && setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Проверка времени и GameOver
  useEffect(() => {
    if (elapsedTime >= 600 && isRunning) {
      handleGameOver();
    }
    if (elapsedTime >= 300 && !showCat) {
      setShowCat(true);
    }
  }, [elapsedTime, showCat]);

  // Инициализация пользователя
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    user && setUserId(user);
  }, []);

  // Загрузка пользовательских настроек
  const loadUserCoordinates = async () => {
    try {
      const matrixName = encodeURIComponent(matrixInfo.matrix_info.matrix_name);
      const response = await fetch(`http://localhost:8000/${userId}/load-graph-settings/${matrixName}`);
      if (response.ok) {
        const data = await response.json();
        applyCoordinates(data);
      }
    } catch (e) { console.error(e); }
  };

  // Загрузка дефолтных настроек
  const loadDefaultCoordinates = () => {
    const matrixName = encodeURIComponent(matrixInfo.matrix_info.matrix_name);
    fetch(`http://localhost:8000/load-graph-settings/${matrixName}`)
      .then(res => res.json())
      .then(data => applyCoordinates(data))
      .catch(() => console.error("Failed to load default settings"));
  };

  // Применение координат
  const applyCoordinates = (data) => {
    if (data.graph_settings) {
      // Применение позиции и масштаба
    }
    if (data.node_coordinates) {
      // Применение координат узлов
    }
  };

  // Сохранение настроек
  const saveGraphSettings = async () => {
    // Реализация сохранения через GraphCanvas
  };

  // Обработка GameOver
  const handleGameOver = () => {
    setIsRunning(false);
    setShowGameOverModal(true);
    gameOverSoundRef.current?.play();
    const bgAudio = document.getElementById("backgroundMusic");
    bgAudio && bgAudio.pause();
  };

  // Логика ходов
  const handleMakeMove = async (calculatedScore) => {
    try {
      const selectedNodesDict = createSelectedNodesDictionary(selectedNodes, lastIndex);
      const response = await fetch("http://localhost:5000/calculate_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedNodes: selectedNodesDict,
          matrixName: matrixInfo.matrix_info.matrix_name
        })
      });
      const data = await response.json();
      if (data) {
        setScore(prev => prev + data.turn_score);
        setMovesHistory(prev => [...prev, { nodes: selectedNodes, score: data.turn_score }]);
        setDisabledNodes(prev => [...prev, ...selectedNodes]);
        handleClearSelection();
        setLastIndex(prev => prev + selectedNodes.length);
      }
    } catch (e) { console.error(e); }
  };

  // Создание словаря для ходов
  const createSelectedNodesDictionary = (nodes, startIndex) => {
    return nodes.reduce((acc, node, i) => {
      acc[startIndex + i + 1] = node;
      return acc;
    }, {});
  };

  // Очистка выбора
  const handleClearSelection = () => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  // Старт/Стоп
  const handleStart = () => {
    setIsRunning(true);
    setElapsedTime(0);
    setScore(0);
    setMovesHistory([]);
    setDisabledNodes([]);
  };

  const handleStop = () => {
    setIsRunning(false);
    setStopwatchHistory([...stopwatchHistory, {
      time: elapsedTime,
      score,
      moves: movesHistory
    }]);
  };

  // Обработчики для GraphCanvas
  const handleNodeClick = (nodes, edges) => {
    // Реализация выбора узлов/ребер через GraphCanvas
  };

  // Звуковые эффекты
  useEffect(() => {
    hoverSoundRef.current = new Audio("/sounds/clearSection.mp3");
    hoverSoundRef.current.volume = 0.05;
    gameOverSoundRef.current = new Audio("/sounds/gameOver.mp3");
    gameOverSoundRef.current.volume = 0.2;
  }, []);

  // Рендер
  return (
    <div className="graph-layout full-height">
      {showCat && <CatAnimation triggerAnimation />}
      {showGameOverModal && (
        <div className="game-over-modal">
          <h2>Game Over</h2>
          <p>Score: {score}</p>
          <button onClick={() => setShowGameOverModal(false)}>OK</button>
        </div>
      )}
      <div className="graph-side graph-left">
        <VerticalProgressBar currentTime={elapsedTime} maxTime={600} />
      </div>
      <div className="graph-center">
        <GraphCanvas
          matrixInfo={matrixInfo}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          selectedEdges={selectedEdges}
          setSelectedEdges={setSelectedEdges}
          disabledNodes={disabledNodes}
          onNodeClick={handleNodeClick}
          loadUserCoordinates={loadUserCoordinates}
          saveGraphSettings={saveGraphSettings}
          backgroundColor={backgroundColor}
          positiveEdgeColor={positiveEdgeColor}
          negativeEdgeColor={negativeEdgeColor}
          nodeColor={nodeColor}
          physicsEnabled={physicsEnabled}
          nodeSize={nodeSize}
          edgeRoundness={edgeRoundness}
        />
      </div>
      <div className="graph-side graph-right">
        <Stopwatch
          elapsedTime={elapsedTime}
          score={score}
          onStart={handleStart}
          onStop={handleStop}
          isRunning={isRunning}
          openSettings={() => setShowSettingsModal(true)}
        />
        <MovesSidebar
          selectedNodes={selectedNodes}
          clearSelection={handleClearSelection}
          makeMove={handleMakeMove}
          disabledNodes={disabledNodes}
          score={score}
          movesHistory={movesHistory}
          showHistoryModal={showHistoryModal}
          toggleHistory={() => setShowHistoryModal(!showHistoryModal)}
        />
      </div>
      <GraphSettingsModal 
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={saveGraphSettings}
        onReset={loadDefaultCoordinates}
      />
    </div>
  );
}