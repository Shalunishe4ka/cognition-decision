import { use, useState } from 'react'

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
    const [positiveEdgeColor, setPositiveEdgeColor] = useState("#00FF00"); // Состояние для цвета положительных ребер
    const [negativeEdgeColor, setNegativeEdgeColor] = useState("#FF0000"); // Состояние для цвета отрицательных ребер
    const [physicsEnabled, setPhysicsEnabled] = useState(false);
    const [nodeSize, setNodeSize] = useState(40);
    const [edgeRoundness, setEdgeRoundness] = useState(0.15); // Степерь искривления рёбер
    // Получаем текущего пользователя из localStorage
    const [userId, setUserId] = useState(localStorage.getItem("currentUser") || "defaultUser");
    const [nodeColor, setNodeColor] = useState("#0b001a"); // Состояние для цвета узлов
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0)
    const [progress, setProgress] = useState(0);



    return {
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
        userId, setUserId,
        nodeColor, setNodeColor,
        isLoading, setIsLoading,
        error, setError,
        currentTime, setCurrentTime,
        progress, setProgress,

    }
}

