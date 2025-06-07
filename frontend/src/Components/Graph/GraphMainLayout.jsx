import React, { useEffect } from 'react'
import { GraphComponent } from './GraphComponent';
import { useCustomStates } from '../../CustomStates';
import { useLocation, useParams } from 'react-router-dom';
import { getMatrixByUUID } from '../../clientServerHub';
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText"
import { cards, cardcreds } from '../Solar/ModalWindowCards/cards'
import "./Styles/GraphStyles.css"

// [CAT LOGIC] - Импортируем CatAnimation
import CatAnimation from "../Cat/CatAnimation"; // <-- скорректируйте путь
import { InfoModalWindow } from './InfoModalWindow';
import { GameOverModalWindow } from './GameOverModalWindow';


export const GraphMainLayout = ({ setHeaderShow }) => {
  useEffect(() => {
    setHeaderShow(true);
  }, [setHeaderShow]);
  const {
    graphData, setGraphData,
    highlightedNode, setHighlightedNode,
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
    isRunning, setIsRunning,
    currentTime, setCurrentTime,
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
    isLoading, setIsLoading, error, setError, handleLoadCoordinates,
    hoverSoundRef, gameOverSoundRef,
    intervalRef, networkRef, applyCoordinates,
    handleClear, handleMakeMove, handleClearEdges,
    nodeColor, setIsNetworkReady, isNetworkReady,
    graphDataState, setGraphDataState,
    showCat, setShowCat, maxTime,
    catAnimationLaunched, setCatAnimationLaunched, showHistory,
    history, setHistory,
  } = useCustomStates();

  const location = useLocation();
  const selectedPlanetLocal = location.state?.selectedPlanet;
  const { uuid } = useParams();

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        if (!uuid) return;
        setIsLoading(true);
        setError(null);

        const matrixData = await getMatrixByUUID(uuid);
        // console.log("Matrix data received:", matrixData);
        setMatrixInfo(matrixData);

      } catch (err) {
        console.error("Ошибка загрузки матрицы:", err);
        setError(err.message);
        setMatrixInfo(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrixData();
  }, [uuid, setMatrixInfo, setIsLoading, setError]);

  useEffect(() => {
    const halfTime = Math.floor(maxTime / 2);
    
    if (
      (currentTime === 30 ||
       currentTime === halfTime ||
       currentTime === (maxTime - 60)) &&
      !catAnimationLaunched
    ) {
      setShowCat(true);
      setCatAnimationLaunched(true);
    }
  }, [currentTime, catAnimationLaunched, maxTime]);

  if (isLoading) return <div className="loading-status">Загрузка графа...</div>;
  if (error) return <div className="error-status">Ошибка: {error}</div>;
  if (!matrixInfo) return <div className="error-status">Данные матрицы не найдены</div>;



  const planetColor = cardcreds[selectedPlanetLocal.name]?.color || "white";
  const planetName = selectedPlanetLocal.name;
  const currentCard = cards[planetName].find((card) => card.uuid === uuid);
  const modelName = currentCard?.title;
  const planetImg = currentCard?.image;

  const graphProps = {
    graphData, setGraphData,
    highlightedNode, setHighlightedNode,
    selectedNodes, setSelectedNodes,
    selectedEdges, setSelectedEdges,
    isRunning, setIsRunning,
    currentTime, setCurrentTime,
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
    uuid, handleLoadCoordinates, applyCoordinates,
    handleClear, handleMakeMove, handleClearEdges, nodeColor,
    setIsNetworkReady, isNetworkReady,
    graphDataState, setGraphDataState, planetColor,
    modelName, planetImg, showHistory, history, setHistory,
  };

  return (
    <div className="layout-challenge-container">
      <ChallengeYourMindText />
      <GraphComponent {...graphProps} />
      {showCat && (
        <CatAnimation
          triggerAnimation={true}
          stopAtX={1400}
          onAnimationEnd={() => {
            setShowCat(false);           // скрыть кота
            setCatAnimationLaunched(false); // разрешить повторный запуск
          }}
        />

      )}
      <InfoModalWindow planetColor={planetColor} isClosing={isClosing} />
      <GameOverModalWindow planetColor={planetColor} score={score} />
    </div>
  )
}
