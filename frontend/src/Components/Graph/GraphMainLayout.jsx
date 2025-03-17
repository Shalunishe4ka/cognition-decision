import React, { useEffect, useRef } from 'react'
import { GraphComponent } from './GraphComponent';
import { useCustomStates } from './CustomStates';
import { useLocation, useParams } from 'react-router-dom';
import { getAllMatrices, getMatrixByUUID } from '../Solar/ModalWindowCards/clientServerHub';
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText"
export const GraphMainLayout = () => {
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
        isLoading, setIsLoading, error, setError

    } = useCustomStates();
    const hoverSoundRef = useRef(null);
    const gameOverSoundRef = useRef(null);
    const intervalRef = useRef();
    const networkRef = useRef(null);
    const location = useLocation();
    const selectedPlanetLocal = location.state?.selectedPlanet;
    const selectedCardIndexLocal = location.state?.selectedCardIndex;
    const { uuid } = useParams();

    useEffect(() => {
        const fetchMatrixData = async () => {
            try {
                if (!uuid) return;

                setIsLoading(true);
                setError(null);

                // Получаем сразу распарсенные данные
                const matrixData = await getMatrixByUUID(uuid);
                console.log("Matrix data received:", matrixData);

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

    // Состояния загрузки и ошибок
    if (isLoading) return <div className="loading-status">Загрузка графа...</div>;
    if (error) return <div className="error-status">Ошибка: {error}</div>;
    if (!matrixInfo) return <div className="error-status">Данные матрицы не найдены</div>;




    const graphProps = {
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
        selectedCardIndexLocal, uuid

    }
    return (
        <div>
            <ChallengeYourMindText />
            <GraphComponent {...graphProps} />
        </div>
    )
}
