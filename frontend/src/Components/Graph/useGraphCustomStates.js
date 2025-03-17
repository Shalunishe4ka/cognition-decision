import { useState } from "react";

export const useGraphCustomStates = () => {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [movesHistory, setMovesHistory] = useState([]);
  const [disabledNodes, setDisabledNodes] = useState([]);
  const [showCat, setShowCat] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stopwatchHistory, setStopwatchHistory] = useState([]);
  const [lockedNodes, setLockedNodes] = useState({});
  const [lastIndex, setLastIndex] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("currentUser") || "defaultUser");
  const [showNodeList, setShowNodeList] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // ➕ ДОБАВЛЕНО
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  return {
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
    highlightedNode, setHighlightedNode,           // ➕ ДОБАВЛЕНО
    hoveredNode, setHoveredNode,                   // ➕ ДОБАВЛЕНО
    cursorPosition, setCursorPosition,             // ➕ ДОБАВЛЕНО
  };
};
