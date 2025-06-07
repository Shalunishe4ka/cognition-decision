import React, { useEffect, useRef } from 'react'
import { GraphCanvasRender } from './GraphCanvasRender'
import Stopwatch from './Stopwatch'
import VerticalProgressBar from './VerticalProgressBar'
import { Buttons } from './Buttons'
import { HistoryTable } from './HistoryTable'

export const GraphComponent = (props) => {
  const {
    graphData, setGraphData,
    setHighlightedNode,
    setSelectedNodes,
    selectedEdges, setSelectedEdges,
    history, setHistory,
    setShowNodeList, lockedNodes,
    setHoveredNode, handleLoadCoordinates,
    disabledNodes, matrixInfo,
    positiveEdgeColor, negativeEdgeColor,
    physicsEnabled, nodeSize,
    edgeRoundness, intervalRef,
    networkRef, selectedPlanetLocal,
    uuid, nodeColor, applyCoordinates,
    handleClear, handleMakeMove,
    selectedNodes, hoveredNode,
    showModal, setShowModal,
    lastIndex, showNodeList, handleClearEdges,
    setIsNetworkReady, isNetworkReady,
    graphDataState, setGraphDataState,
    planetColor, modelName, planetImg,
    showHistory, hoverSoundRef
  } = props


  // const didLoadCoordsRef = useRef(false); // флаг


  // // Добавляем useEffect, который при загрузке графа вызывает handleLoadCoordinates.
  useEffect(() => {
    if (!selectedPlanetLocal) return;
    if (!matrixInfo) return;
    if (!isNetworkReady) return;

    console.log("Сеть готова, применяем координаты...");
    handleLoadCoordinates(uuid, applyCoordinates);
  }, [matrixInfo, isNetworkReady, uuid, applyCoordinates]);

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
    networkRef, handleClear, handleMakeMove,
    selectedNodes, hoveredNode,
    showModal, setShowModal, lastIndex, showNodeList,
    handleClearEdges, setIsNetworkReady,
    graphDataState, setGraphDataState, hoverSoundRef
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
            <Buttons
              matrixUuid={uuid}                // передаём uuid
              applyCoordinates={applyCoordinates}  // передаём функцию для обновления графа
              matrixInfo={matrixInfo}
              networkRef={networkRef}
              planetColor={planetColor}
              planetImg={planetImg}
            />
          </div>
        </div>
      </div>
      {/* если showHistory – показываем таблицу вместо графа */}
      {showHistory ? (
        <div style={{ padding: "20px" }}>
          <HistoryTable
            matrixUuid={uuid}
            planetColor={planetColor}
            history={history}
            setHistory={setHistory}
          />
        </div>
      ) : (
        <div className="graph-component-row">
          <VerticalProgressBar />
          <GraphCanvasRender {...graphCanvasProps} />
          <Stopwatch planetColor={planetColor} />
        </div>
      )}
    </div>
  )
}
