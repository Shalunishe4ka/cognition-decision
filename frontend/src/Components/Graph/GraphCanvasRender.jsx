import React, { useEffect, useRef } from 'react';
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import { AllNodesList } from "./AllNodesList";
import { SelectedNodesList } from './SelectedNodes';
import { Button } from 'react-bootstrap';

export const GraphCanvasRender = ({
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
  lastIndex,
  hoveredNode,
  selectedNodes,
  handleClear,
  handleMakeMove,
  showNodeList,
  handleClearEdges,
  setIsNetworkReady,
}) => {
  const localNetworkRef = useRef(null);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  // Создаём ref для актуальных disabledNodes
  const disabledNodesRef = useRef(disabledNodes);

  // Обновляем disabledNodesRef при изменении disabledNodes
  useEffect(() => {
    disabledNodesRef.current = disabledNodes;
  }, [disabledNodes]);

  // 1) Инициализация DataSet и Network только один раз, когда получен matrixInfo
  useEffect(() => {
    if (!matrixInfo?.edges || !matrixInfo?.nodes) return;
    // Если DataSet уже созданы – не пересоздаём их
    if (nodesRef.current && edgesRef.current) return;

    const { edges, nodes: oldNodes } = matrixInfo;
    const nodesDataSet = new DataSet();
    const edgesDataSet = new DataSet();
    const nodesMap = new Map();

    edges.forEach(({ from, to, value }) => {
      if (value === 0) return;
      const fromId = from;
      const toId = to;

      // Добавляем узел-источник, если ещё не добавлен
      if (oldNodes[fromId - 1] && !nodesMap.has(fromId)) {
        const isDisabled = disabledNodes.includes(fromId);
        const nodeData = {
          id: fromId,
          label: `${fromId}`,
          title: oldNodes[fromId - 1].name,
          description: oldNodes[fromId - 1].description,
          color: { background: isDisabled ? "gray" : nodeColor },
          font: { size: isDisabled ? 14 : 16 },
        };
        nodesMap.set(fromId, nodeData);
        nodesDataSet.add(nodeData);
      }

      // Добавляем узел-приёмник, если ещё не добавлен
      if (oldNodes[toId - 1] && !nodesMap.has(toId)) {
        const isDisabled = disabledNodes.includes(toId);
        const nodeData = {
          id: toId,
          label: `${toId}`,
          title: oldNodes[toId - 1].name,
          description: oldNodes[toId - 1].description,
          color: { background: isDisabled ? "gray" : nodeColor },
          font: { size: isDisabled ? 14 : 16 },
        };
        if (oldNodes[toId - 1].target === 1) {
          nodeData.color = { background: "gold" };
          nodeData.font = { size: 25 };
        }
        nodesMap.set(toId, nodeData);
        nodesDataSet.add(nodeData);
      }

      // Добавляем ребро
      try {
        const edgeId = `${fromId}-${toId}`;
        edgesDataSet.add({
          id: edgeId,
          from: fromId,
          to: toId,
          rawValue: value,
          width: 1,
          title: `При увеличении ${oldNodes[fromId - 1].name} ${value > 0 ? "увеличивается" : "уменьшается"} ${oldNodes[toId - 1].name} на ${value}`,
          label: value.toString(),
          smooth: { type: "continues", roundness: edgeRoundness },
          color: { color: value > 0 ? positiveEdgeColor : negativeEdgeColor },
        });
      } catch (e) {
        console.log("Ошибка при создании ребра:", e);
      }
    });

    // Сохраняем DataSet в useRef, чтобы не пересоздавать их при обновлении других состояний
    nodesRef.current = nodesDataSet;
    edgesRef.current = edgesDataSet;
    if (setGraphData) {
      setGraphData({ nodes: nodesDataSet, edges: edgesDataSet });
    }

    // Инициализируем Network один раз
    const container = document.getElementById("graph-container");
    if (!container) {
      console.warn("Контейнер #graph-container не найден");
      return;
    }
    const options = {
      edges: {
        smooth: { type: "curvedCW", roundness: edgeRoundness },
        scaling: { min: 1, max: 1, label: { enabled: true, min: 11, max: 11, maxVisible: 55, drawThreshold: 5 } },
        arrows: { to: true },
        font: { size: 18, align: "horizontal", color: "white", strokeWidth: 2, strokeColor: "black" },
        color: { highlight: "white", hover: "white" },
        chosen: true,
      },
      physics: {
        enabled: physicsEnabled,
        barnesHut: { gravitationalConstant: -50000, centralGravity: 0.3, springLength: 95, springConstant: 0.04, damping: 0.09, avoidOverlap: 3.4 },
        stabilization: { enabled: true, iterations: 1000, updateInterval: 25 },
      },
      nodes: {
        shape: "circle",
        size: nodeSize,
        font: { size: 14, color: "white", align: "center" },
        borderWidth: 2,
        borderWidthSelected: 4,
      },
      interaction: { hover: true, tooltipDelay: 300, multiselect: true },
    };

    const newNetwork = new Network(container, { nodes: nodesDataSet, edges: edgesDataSet }, options);
    localNetworkRef.current = newNetwork;
    if (networkRef) {
      networkRef.current = newNetwork;
    }
    if (setIsNetworkReady) {
      // console.log("Сеть создана, устанавливаем isNetworkReady = true");
      setIsNetworkReady(true);
    }

    // Устанавливаем обработчики, используя актуальное значение disabledNodes через disabledNodesRef
    newNetwork.on("click", (event) => {
      const clickedNodeIds = event.nodes || [];
      const clickedEdgeIds = event.edges || [];
      if (clickedNodeIds.some((id) => disabledNodesRef.current.includes(Number(id)))) {
        newNetwork.unselectAll();
        return;
      }
      // Дальше обычная логика:
      if (clickedNodeIds.length === 1) {
        const clickedNodeId = clickedNodeIds[0];
        if (!lockedNodes[clickedNodeId] && !disabledNodesRef.current.includes(Number(clickedNodeId))) {
          setSelectedNodes((prev) =>
            prev.includes(clickedNodeId)
              ? prev.filter((id) => id !== clickedNodeId)
              : [...prev, clickedNodeId]
          );
        }
      }
      if (clickedEdgeIds.length > 0) {
        setSelectedEdges((prev) => {
          const newSelected = new Set(prev);
          clickedEdgeIds.forEach((edgeId) => {
            if (newSelected.has(edgeId)) {
              newSelected.delete(edgeId);
              const edgeObj = edgesRef.current.get(edgeId);
              if (edgeObj) {
                edgesRef.current.update({
                  id: edgeId,
                  width: 1,
                  color: { color: edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor },
                });
              }
            } else {
              newSelected.add(edgeId);
              const edgeObj = edgesRef.current.get(edgeId);
              if (edgeObj) {
                edgesRef.current.update({
                  id: edgeId,
                  width: 5,
                  color: { color: "white" },
                });
              }
            }
          });
          return Array.from(newSelected);
        });
      }
    });
    newNetwork.on("hoverNode", (event) => {
      // Если узел задизейблен, сбрасываем выделение и не обрабатываем hover
      if (disabledNodesRef.current.includes(Number(event.node))) {
        newNetwork.unselectAll();
        setShowNodeList(false);
        setHoveredNode(null);
        return;
      }
      setHighlightedNode(event.node);
      setShowNodeList(true);
      setHoveredNode(event.node);
    });
    newNetwork.on("blurNode", () => {
      setHighlightedNode(null);
      setShowNodeList(false);
      setHoveredNode(null);
    });
    newNetwork.on("selectNode", (params) => {
      const selectableNodes = params.nodes.filter((id) => !lockedNodes.hasOwnProperty(String(id)));
      newNetwork.setSelection({ nodes: selectableNodes, edges: params.edges });
    });
  }, [
    matrixInfo,
    nodeColor,
    positiveEdgeColor,
    negativeEdgeColor,
    edgeRoundness,
    physicsEnabled,
    nodeSize,
    disabledNodes,
    setIsNetworkReady,
    setGraphData,
    networkRef,
    lockedNodes,
  ]);

  // 2) Обновляем стили узлов при изменении disabledNodes (без пересоздания DataSet)
  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.forEach((node) => {
        if (disabledNodes.includes(node.id)) {
          nodesRef.current.update({ id: node.id, color: { background: "gray" } });
        } else {
          nodesRef.current.update({ id: node.id, color: { background: nodeColor } });
        }
      });
    }
  }, [disabledNodes, nodeColor]);

  // 3) Обновляем стили выбранных рёбер
  useEffect(() => {
    if (!edgesRef.current) return;
    selectedEdges.forEach((edgeId) => {
      try {
        edgesRef.current.update({
          id: edgeId,
          width: 5,
          color: { color: "white" },
        });
      } catch (err) {
        console.warn(`Ошибка обновления ребра ${edgeId}:`, err);
      }
    });
    edgesRef.current.forEach((edge) => {
      if (!selectedEdges.includes(edge.id)) {
        edgesRef.current.update({
          id: edge.id,
          width: 1,
          color: { color: edge.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor },
        });
      }
    });
  }, [selectedEdges, positiveEdgeColor, negativeEdgeColor]);

  return (
    <>
      {/* Контейнер для графа – убедитесь, что он всегда рендерится */}
      <div id="graph-container" className="graph-container" />
      {selectedEdges.length > 0 && (
        <div
          className="selected-edges-clear"
          style={{
            position: "absolute",
            top: "240px",
            right: "80px",
            zIndex: 1,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontFamily: "Montserrat",
            color: "black",
          }}
        >
          <p>Выделено рёбер: {selectedEdges.length}</p>
          <Button variant="secondary" onClick={handleClearEdges}>
            Очистить рёбра
          </Button>
        </div>
      )}
      {graphData && showNodeList && (
        <AllNodesList nodes={nodesRef.current ? nodesRef.current.get() : []} hoveredNode={hoveredNode} />
      )}
      {selectedNodes.length > 0 && (
        <SelectedNodesList
          selectedNodes={selectedNodes}
          hoveredNode={hoveredNode}
          lastIndex={lastIndex}
          handleClear={handleClear}
          handleMakeMove={handleMakeMove}
          handleClearEdges={handleClearEdges}
        />
      )}
    </>
  );
};
