import React, { useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import { ScienceAllNodesList } from "./ScienceAllNodesList";
import { ScienceSelectedNodesList } from "./ScienceSelectedNodes";
import { useCustomStates } from "../../CustomStates";

export const ScienceGraphComponent = () => {
  const {
    matrixInfo,
    disabledNodes,
    nodeColor,
    edgeRoundness,
    positiveEdgeColor,
    negativeEdgeColor,
    setGraphData,
    graphData,
    physicsEnabled,
    nodeSize,
    setHighlightedNode,
    setShowNodeList,
    setHoveredNode,
    lockedNodes,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
    networkRef,
    lastIndex,
    hoveredNode,
    handleClear,
    handleMakeMove,
    showNodeList,
    handleClearEdges,
    handleLoadCoordinates,
    applyCoordinates,
  } = useCustomStates();

  // Локальные refs для DataSet узлов, рёбер и экземпляра сети
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  const localNetworkRef = useRef(null);
  // Ref для актуальных disabledNodes
  const disabledNodesRef = useRef(disabledNodes);

  // При изменении disabledNodes обновляем ref и убираем из selectedNodes объекты, ставшие недоступны
  useEffect(() => {
    disabledNodesRef.current = disabledNodes;
    setSelectedNodes((prev) =>
      prev.filter((node) => !disabledNodes.some((disabled) => disabled.id === node.id))
    );
  }, [disabledNodes, setSelectedNodes]);

  // 1) Инициализация DataSet и Network один раз, когда matrixInfo готова
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
        const isDisabled = disabledNodes.some((node) => node.id === fromId);
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
        const isDisabled = disabledNodes.some((node) => node.id === toId);
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
      const edgeId = `${fromId}-${toId}`;
      try {
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

    // Сохраняем DataSet в ref
    nodesRef.current = nodesDataSet;
    edgesRef.current = edgesDataSet;
    if (setGraphData) {
      setGraphData({ nodes: nodesDataSet, edges: edgesDataSet });
    }

    // Инициализируем Network
    const container = document.getElementById("graph-container");
    if (!container) {
      console.warn("Контейнер #graph-container не найден");
      return;
    }
    const options = {
      edges: {
        smooth: { type: "curvedCW", roundness: edgeRoundness },
        scaling: {
          min: 1,
          max: 1,
          label: { enabled: true, min: 11, max: 11, maxVisible: 55, drawThreshold: 5 },
        },
        arrows: { to: true },
        font: { size: 18, align: "horizontal", color: "white", strokeWidth: 2, strokeColor: "black" },
        color: { highlight: "white", hover: "white" },
        chosen: true,
      },
      physics: {
        enabled: physicsEnabled,
        barnesHut: {
          gravitationalConstant: -50000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 3.4,
        },
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

    // Обработчики событий
    newNetwork.on("click", (event) => {
      const clickedNodeIds = event.nodes || [];
      const clickedEdgeIds = event.edges || [];
      // Если клик по disabled узлу – снимаем выделение
      if (
        clickedNodeIds.some((id) =>
          disabledNodesRef.current.some((node) => node.id === Number(id))
        )
      ) {
        newNetwork.unselectAll();
        return;
      }
      if (clickedNodeIds.length === 1) {
        const clickedNodeId = clickedNodeIds[0];
        if (
          !lockedNodes[clickedNodeId] &&
          !disabledNodesRef.current.some((node) => node.id === Number(clickedNodeId))
        ) {
          // Получаем объект узла из graphData (предполагается, что graphData уже установлен)
          const nodeObj = graphData.nodes.get(clickedNodeId);
          if (nodeObj) {
            setSelectedNodes((prev) =>
              prev.find((n) => n.id === clickedNodeId)
                ? prev.filter((n) => n.id !== clickedNodeId)
                : [...prev, nodeObj]
            );
          }
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
                  color: {
                    color: edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
                  },
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
      if (
        disabledNodesRef.current.some((node) => node.id === Number(event.node))
      ) {
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
      const selectableNodes = params.nodes.filter(
        (id) => !lockedNodes.hasOwnProperty(String(id))
      );
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
    setGraphData,
    networkRef,
    lockedNodes,
  ]);

  // 2) Обновляем стили узлов при изменении disabledNodes
  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.forEach((node) => {
        if (disabledNodes.some((d) => d.id === node.id)) {
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

  // 4) Загрузка координат графа (если требуется)
  useEffect(() => {
    if (graphData && matrixInfo?.matrix_info?.uuid && networkRef.current) {
      handleLoadCoordinates(matrixInfo.matrix_info.uuid, applyCoordinates);
    }
  }, []);

  return (
    <>
      <div id="graph-container" className="graph-container" />
      {graphData && showNodeList && (
        <ScienceAllNodesList
          nodes={nodesRef.current ? nodesRef.current.get() : []}
          hoveredNode={hoveredNode}
        />
      )}
      {selectedNodes.length > 0 && (
        <ScienceSelectedNodesList
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

export default ScienceGraphComponent;
