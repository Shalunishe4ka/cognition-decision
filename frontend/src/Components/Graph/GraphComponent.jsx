import React from 'react'
import { GraphCanvasRender } from './GraphCanvasRender'
import Stopwatch from './Stopwatch'
import VerticalProgressBar from './VerticalProgressBar'
import { cards, cardcreds } from '../Solar/ModalWindowCards/cards'
import { Buttons } from './Buttons'


export const GraphComponent = (props) => {
  const {
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
    uuid,
    nodeColor, setNodeColor,
    // backgroundColor, // Если хочешь динамически, придётся либо CSS variable, либо вернуть inline
  } = props

  // Если планета не задана - сделаем проверку
  if (!selectedPlanetLocal) {
    return <div>Нет выбранной планеты</div>;
  }

  const planetColor = cardcreds[selectedPlanetLocal.name]?.color || "white";
  const planetName = selectedPlanetLocal.name;
  const currentCard = cards[planetName].find((card) => card.uuid === uuid);
  const modelName = currentCard?.title;
  const planetImg = currentCard?.image;

  // Пример функции применения координат
  const applyCoordinates = (data) => {
    if (!data || !networkRef?.current) return;
    const { graph_settings, node_coordinates } = data;
    const visNetwork = networkRef.current.body;

    // Проставляем координаты
    if (node_coordinates) {
      Object.entries(node_coordinates).forEach(([nodeId, coords]) => {
        if (visNetwork.nodes[nodeId]) {
          visNetwork.nodes[nodeId].x = coords.x;
          visNetwork.nodes[nodeId].y = coords.y;
        }
      });
    }

    // Применяем позицию/масштаб
    if (graph_settings && networkRef.current.moveTo) {
      networkRef.current.moveTo({
        position: graph_settings.position || { x: 0, y: 0 },
        scale: graph_settings.scale || 1,
        animation: { duration: 1000, easingFunction: "easeInOutQuad" },
      });
    }
    networkRef.current.redraw();
  };

  // Настраиваем пропсы для рендера графа
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
    networkRef,
  };

  return (
    <div>
      <div className="graph-component-header">
        <div style={{ display: "flex" }}>
          <img
            src={planetImg}
            alt="planet"
            style={{ width: "150px", height: "150px", borderRadius: "15px" }}
          />
          <div className="graph-component-inner">
            <h1 style={{ position: "relative", color: planetColor }}>
              {modelName}
            </h1>
            <Buttons />
          </div>
        </div>
      </div>

      <div className="graph-component-row">
        <VerticalProgressBar />
        <GraphCanvasRender {...graphCanvasProps} />
        <Stopwatch />
      </div>
    </div>
  )
}
