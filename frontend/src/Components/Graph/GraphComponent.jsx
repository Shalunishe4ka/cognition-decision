import React, { useEffect, useRef } from "react";
import GraphCanvas from "./GraphCanvas";
import MovesSidebar from "./MovesSidebar";
import GraphSettingsModal from "./GraphSettingsModal";
import VerticalProgressBar from "./VerticalProgressBar";
import Stopwatch from "./Stopwatch";
import CatAnimation from "./CatAnimation";
import { cardcreds, cards } from "../Solar/ModalWindowCards/cards";
import { Link } from "react-router-dom";
import { Modal, Button, ListGroup, Card } from "react-bootstrap";
import InfoIcon from "@mui/icons-material/Info";
import { useGraphCustomStates } from "./useGraphCustomStates";

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
  const {
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
    score, setScore,
    isRunning, setIsRunning,
    elapsedTime, setElapsedTime,
    movesHistory, setMovesHistory,
    disabledNodes, setDisabledNodes,
    showCat, setShowCat,
    showHistoryModal, setShowHistoryModal,
    stopwatchHistory, setStopwatchHistory,
    lockedNodes, setLockedNodes,
    lastIndex, setLastIndex,
    showGameOverModal, setShowGameOverModal,
    userId, setUserId,
    showNodeList, setShowNodeList,
    showSettingsModal, setShowSettingsModal,
    highlightedNode, setHighlightedNode,
    hoveredNode, setHoveredNode,
    cursorPosition, setCursorPosition,
  } = useGraphCustomStates();

  const hoverSoundRef = useRef();
  const gameOverSoundRef = useRef();
  const intervalRef = useRef();
  const maxTime = 600

  useEffect(() => {
    hoverSoundRef.current = new Audio("/sounds/clearSection.mp3");
    hoverSoundRef.current.volume = 0.05;
    gameOverSoundRef.current = new Audio("/sounds/gameOver.mp3");
    gameOverSoundRef.current.volume = 0.2;
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (elapsedTime >= maxTime && isRunning) {
      setIsRunning(false);
      handleClearSelection();
      setShowGameOverModal(true);
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.currentTime = 0;
        gameOverSoundRef.current.play().catch(err => console.error("Game Over звук:", err));
      }
      const bgAudio = document.getElementById("backgroundMusic");
      if (bgAudio) bgAudio.pause();
    }
    if (elapsedTime >= maxTime / 2 && !showCat) {
      setShowCat(true);
    }
  }, [elapsedTime, isRunning, showCat]);

  const handleClearSelection = () => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play().catch(err => console.error("Звук hover:", err));
    }
    setSelectedNodes([]);
    setSelectedEdges([]);
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
    setStopwatchHistory(prev => [...prev, { time: elapsedTime, score, moves: movesHistory }]);
  };

  const createSelectedNodesDictionary = (nodes, startIndex) => {
    return nodes.reduce((acc, node, i) => {
      acc[startIndex + i + 1] = node;
      return acc;
    }, {});
  };

  const handleMakeMove = async () => {
    const availableNodesCount = matrixInfo?.nodes?.length - disabledNodes.length;
    const minRequired = availableNodesCount < 3 ? availableNodesCount : 3;
    if (selectedNodes.length < minRequired) {
      alert(`Нужно минимум ${minRequired} вершин.`);
      return;
    }
    const selectedDict = createSelectedNodesDictionary(selectedNodes, lastIndex);
    try {
      const response = await fetch("http://localhost:8000/calculate_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedNodes: selectedDict,
          matrixName: matrixInfo.matrix_info.matrix_name
        })
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();
      if (data) {
        const { turn_score, total_score } = data;
        setMovesHistory(prev => [...prev, { nodes: selectedNodes, score: turn_score }]);
        setScore(total_score);
        setDisabledNodes(prev => [...prev, ...selectedNodes]);
        handleClearSelection();
        setLastIndex(prev => prev + selectedNodes.length);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error("Ошибка хода:", error);
    }
  };

  const buttonStyle = {
    border: `1px solid ${selectedPlanet ? cardcreds[selectedPlanet.name].color : "#fff"}`,
    color: "black",
    backgroundColor: selectedPlanet ? cardcreds[selectedPlanet.name].color : "#fff",
  };

  return (
    <div className="graph-layout full-height">
      {showCat && <CatAnimation triggerAnimation={true} />}

      {/* Game Over Modal */}
      <Modal show={showGameOverModal} centered onHide={() => setShowGameOverModal(false)}>
        <Modal.Header><Modal.Title>Game Over</Modal.Title></Modal.Header>
        <Modal.Body><h3>Score: {Math.max(0, score)}</h3></Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowGameOverModal(false)} style={buttonStyle}>OK</Button>
        </Modal.Footer>
      </Modal>

      {/* Панель кнопок */}
      <div style={{ position: "relative", zIndex: 1000, marginBottom: "10px" }}>
        <ul className="Button-Group" style={{ display: "flex", gap: "10px", listStyle: "none", padding: 0 }}>
          <li><button className="game-button" onClick={() => setShowSettingsModal(true)}><InfoIcon /> Details</button></li>
          <li><Link to={"/science"} state={{ selectedPlanet, selectedCardIndex }}><button className="game-button" disabled={isRunning}>Science</button></Link></li>
        </ul>
      </div>

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
          hoverSoundRef={hoverSoundRef}
          setShowNodeList={setShowNodeList}
          setHighlightedNode={setHighlightedNode}
          setHoveredNode={setHoveredNode}
          setCursorPosition={setCursorPosition}
        />
      </div>

      <div className="graph-side graph-left">
        <VerticalProgressBar currentTime={elapsedTime} maxTime={maxTime} />
      </div>

      <div className="graph-side graph-right">
        <Stopwatch elapsedTime={elapsedTime} score={score} onStart={handleStart} onStop={handleStop} isRunning={isRunning} />
        <MovesSidebar selectedNodes={selectedNodes} clearSelection={handleClearSelection} makeMove={handleMakeMove} disabledNodes={disabledNodes} score={score} movesHistory={movesHistory} showHistoryModal={showHistoryModal} toggleHistory={() => setShowHistoryModal(!showHistoryModal)} />
      </div>

      <GraphSettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      {/* Панель списка узлов */}
      {showNodeList && (
        <div className={`node-list-container visible`}>
          <div className="local-header">
            <h4>Инфо об узле</h4>
            <button onClick={() => setShowNodeList(false)}>X</button>
          </div>
          {/* Вставь сюда содержимое, что хочешь видеть по узлу */}
          <ul className="node-list">
            {selectedNodes.map((nodeId, idx) => (
              <li key={idx}>{`Узел ID: ${nodeId}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
