// GraphComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import GraphCanvas from "./GraphCanvas";
import GraphControls from "./GraphControls";
import MovesSidebar from "./MovesSidebar";
import GraphSettingsModal from "./GraphSettingsModal";
import VerticalProgressBar from "./VerticalProgressBar";

import CatAnimation from "./CatAnimation"; // ваш "кот"
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
  // -----------------------
  // Глобальные стейты
  // -----------------------
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [movesHistory, setMovesHistory] = useState([]);
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [showCat, setShowCat] = useState(false);

  // Пример таймера
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Когда время становится большим, показать кота
  useEffect(() => {
    if (elapsedTime >= 300 && !showCat) {
      setShowCat(true);
    }
  }, [elapsedTime, showCat]);

  // -----------------------
  // Callbacks
  // -----------------------
  const handleClearSelection = () => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const handleMakeMove = (calculatedScore) => {
    // Логика добавления хода в историю
    // и обновления счёта
    setScore(prev => prev + calculatedScore);
    // disable selected nodes
    setDisabledNodes(prev => [...new Set([...prev, ...selectedNodes])]);
    // сбрасываем выбор
    handleClearSelection();
  };

  const handleStart = () => {
    setIsRunning(true);
    setElapsedTime(0);
    setScore(0);
    setMovesHistory([]);
    setDisabledNodes([]);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  // Для окна настроек
  const openSettings = () => setShowSettingsModal(true);
  const closeSettings = () => setShowSettingsModal(false);

  // -----------------------
  // Рендер
  // -----------------------
  return (
    <div className="graph-layout full-height">
      {showCat && <CatAnimation triggerAnimation />}

      {/* Левая колонка: Прогресс */}
      <div className="graph-side graph-left">
        <VerticalProgressBar currentTime={elapsedTime} maxTime={600} />
      </div>

      {/* Центр: Граф */}
      <div className="graph-center">
        <GraphCanvas
          matrixInfo={matrixInfo}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          selectedEdges={selectedEdges}
          setSelectedEdges={setSelectedEdges}
          disabledNodes={disabledNodes}
          backgroundColor={backgroundColor}
          positiveEdgeColor={positiveEdgeColor}
          negativeEdgeColor={negativeEdgeColor}
          nodeColor={nodeColor}
          physicsEnabled={physicsEnabled}
          nodeSize={nodeSize}
          edgeRoundness={edgeRoundness}
        />
      </div>

      {/* Правая колонка: Счёт и кнопки */}
      <div className="graph-side graph-right">
        <GraphControls
          elapsedTime={elapsedTime}
          score={score}
          onStart={handleStart}
          onStop={handleStop}
          isRunning={isRunning}
          openSettings={openSettings}
        />
        <MovesSidebar
          selectedNodes={selectedNodes}
          clearSelection={handleClearSelection}
          makeMove={handleMakeMove}
          disabledNodes={disabledNodes}
          matrixInfo={matrixInfo}
          score={score}
        />
      </div>

      <GraphSettingsModal show={showSettingsModal} onClose={closeSettings} />
    </div>
  );
}
