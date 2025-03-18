// import React, { useEffect } from 'react'
import { GraphCanvasRender } from './GraphCanvasRender'
import Stopwatch from './Stopwatch'
import VerticalProgressBar from './VerticalProgressBar'
import { cards, cardcreds } from '../Solar/ModalWindowCards/cards';
import { Buttons } from './Buttons';

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
    uuid, nodeColor,
    setNodeColor, backgroundColor

}) => {
    const planetColor = cardcreds[selectedPlanetLocal.name].color
    const planetName = selectedPlanetLocal.name
    const currentCard = cards[planetName].find(card => card.uuid === uuid)
    const modelName = currentCard?.title;
    const planetImg = currentCard?.image

    const resetNodeCoordinates = () => {
        loadDefaultCoordinates().then((data) => {
          if (data) {
            applyCoordinates(data);
            alert("Дефолтные настройки графа загружены.");
          } else {
            alert("Дефолтные настройки графа не найдены.");
          }
        });
      };
    

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
        <div>
            <div style={{display: "flex", paddingLeft: "80px", alignItems: "center"}}>
                <div style={{display: "flex"}}>
                <img style={{width: "150px", height: "150px", borderRadius: "15px"}} src={planetImg}/>
                <h1 style={{ position: "relative", color: planetColor }}>{modelName}</h1>
                <Buttons />
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    color: "white",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px 80px",
                    position: "relative",
                    // top: "-20px",
                }}>
                <VerticalProgressBar />
                <GraphCanvasRender {...graphCanvasProps} />
                <Stopwatch />
            </div>
        </div>
    )
}
