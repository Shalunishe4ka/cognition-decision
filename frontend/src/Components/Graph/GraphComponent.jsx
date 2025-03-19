import React, { useEffect, useRef } from 'react'
import { GraphCanvasRender } from './GraphCanvasRender'
import Stopwatch from './Stopwatch'
import VerticalProgressBar from './VerticalProgressBar'
import { cards, cardcreds } from '../Solar/ModalWindowCards/cards'
import { Buttons } from './Buttons'

export const GraphComponent = (props) => {
  const {
    graphData, setGraphData,
    setHighlightedNode,
    setSelectedNodes,
    selectedEdges, setSelectedEdges,
    isRunning, setCurrentTime,
    setShowNodeList, lockedNodes,
    setHoveredNode, handleLoadCoordinates,
    disabledNodes, matrixInfo,
    positiveEdgeColor, negativeEdgeColor,
    physicsEnabled, nodeSize,
    edgeRoundness, intervalRef,
    networkRef, selectedPlanetLocal,
    uuid, nodeColor, applyCoordinates
  } = props

  const planetColor = cardcreds[selectedPlanetLocal.name]?.color || "white";
  const planetName = selectedPlanetLocal.name;
  const currentCard = cards[planetName].find((card) => card.uuid === uuid);
  const modelName = currentCard?.title;
  const planetImg = currentCard?.image;
  const didLoadCoordsRef = useRef(false); // флаг


  // // Добавляем useEffect, который при загрузке графа вызывает handleLoadCoordinates.
  useEffect(() => {
    // Если планета не задана - сделаем проверку
    if (!selectedPlanetLocal) {
      console.warn("Нет выбранной планеты");
      return;
    }

    // Если matrixInfo загружена и граф уже проинициализирован
    if (!didLoadCoordsRef.current && matrixInfo && networkRef.current) {
      handleLoadCoordinates(uuid, applyCoordinates);
      didLoadCoordsRef.current = true;
    }
  }, [matrixInfo, networkRef, uuid, handleLoadCoordinates]);

  // --- Логика запуска/остановки таймера ---
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);


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
      <div className="graph-component-row">
        <VerticalProgressBar />
        <GraphCanvasRender {...graphCanvasProps} />
        <Stopwatch />
      </div>
    </div>
  )
}
