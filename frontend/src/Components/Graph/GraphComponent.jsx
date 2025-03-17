// import React, { useEffect } from 'react'
import { GraphCanvasRender } from './GraphCanvasRender'
import Stopwatch from './Stopwatch'
import VerticalProgressBar from './VerticalProgressBar'


export const GraphComponent = ({

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
    hoverSoundRef, gameOverSoundRef,
    intervalRef, networkRef,
    location, selectedPlanetLocal,
    selectedCardIndexLocal, uuid,
    nodeColor, setNodeColor,
    backgroundColor
}) => {
    console.log("GraphConponent MatrixInfo: ", matrixInfo)
    const graphCanvasProps = {
        matrixInfo,
        disabledNodes,
        nodeColor,
        edgeRoundness,
        positiveEdgeColor,
        negativeEdgeColor,
        setGraphData,
        graphData,
        selectedEdges,
        physicsEnabled,
        nodeSize,
        setHighlightedNode,
        setShowNodeList,
        setHoveredNode,
        lockedNodes,
        setSelectedNodes,
        setSelectedEdges,
        backgroundColor,
    }

    return (
        <div style={{ display: "flex", color: "white", alignItems: "center", justifyContent: "space-between" }}>
            <VerticalProgressBar />
            <GraphCanvasRender {...graphCanvasProps} />
            <Stopwatch />
        </div>
    )
}
