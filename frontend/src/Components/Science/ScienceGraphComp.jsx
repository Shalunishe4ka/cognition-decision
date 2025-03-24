import React, { useEffect } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import { Button } from "react-bootstrap";
import { ScienceAllNodesList } from "./ScienceAllNodeList";
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
    setSelectedEdges,
    networkRef,
    lastIndex,
    hoveredNode,
    handleClear,
    handleMakeMove,
    showNodeList,
    handleClearEdges,
  } = useCustomStates();

  // 1. Построение графа из матрицы
  useEffect(() => {
    if (!matrixInfo) return;

    const nodesDataSet = new DataSet();
    const edgesDataSet = new DataSet();

    matrixInfo.edges.forEach(({ from, to, value }) => {
      if (value !== 0) {
        [from, to].forEach(id => {
          if (!nodesDataSet.get(id)) {
            const node = matrixInfo.nodes[id - 1];
            const isDisabled = disabledNodes.includes(id);
            nodesDataSet.add({
              id,
              label: `${id}`,
              title: node.name,
              description: node.description,
              color: { background: node.target === 1 ? "gold" : (isDisabled ? "gray" : nodeColor) },
              font: { size: node.target === 1 ? 25 : (isDisabled ? 14 : 16) },
            });
          }
        });

        edgesDataSet.add({
          id: `${from}${to}`,
          from,
          to,
          rawValue: value,
          label: value.toString(),
          width: 1,
          title: `При увеличении ${matrixInfo.nodes[from - 1].name} ${value > 0 ? "увеличивается" : "уменьшается"} ${matrixInfo.nodes[to - 1].name} на ${value}`,
          smooth: { type: "continues", roundness: edgeRoundness },
          color: { color: value > 0 ? positiveEdgeColor : negativeEdgeColor },
          arrows: "to",
          font: {
            strokeWidth: 2, // Толщина обводки текста
            strokeColor: "black", // Цвет обводки текста
          },
        });
      }
    });

    setGraphData({ nodes: nodesDataSet, edges: edgesDataSet });
  }, [matrixInfo, disabledNodes, nodeColor, edgeRoundness, positiveEdgeColor, negativeEdgeColor, setGraphData]);

  // 2. Отрисовка графа
  useEffect(() => {
    if (!graphData) return;
    const container = document.getElementById("graph-container");
    if (!container) return;

    const network = new Network(container, graphData, {
      edges: {
        smooth: { type: "curvedCW", roundness: edgeRoundness },
        arrows: { to: true },
        font: { size: 18, color: "white" },
        color: { highlight: "white", hover: "white" },
      },
      physics: { enabled: physicsEnabled },
      nodes: {
        shape: "circle",
        size: nodeSize,
        font: { size: 14, color: "white" },
        borderWidth: 2,
      },
      interaction: { hover: true, tooltipDelay: 300, multiselect: true },
    });

    network.on("click", (event) => handleNodeClick(event, network));
    network.on("hoverNode", (event) => {
      setHoveredNode(event.node);
      setHighlightedNode(event.node);
      setShowNodeList(true);
    });
    network.on("blurNode", () => {
      setHoveredNode(null);
      setHighlightedNode(null);
      setShowNodeList(false);
    });

    networkRef.current = network;
  }, [graphData, edgeRoundness, physicsEnabled, nodeSize]);

  // 3. Логика кликов по узлам и рёбрам
  const handleNodeClick = (event, network) => {
    const [nodeId] = event.nodes;
    const { edges } = event;

    if (nodeId) {
      const isLocked = lockedNodes[nodeId];
      const isDisabled = disabledNodes.includes(nodeId);
      const nodeObj = graphData.nodes.get(nodeId);

      if (!isLocked && !isDisabled && nodeObj) {
        setSelectedNodes(prev => {
          const exists = prev.find(n => n.id === nodeId);
          if (exists) {
            return prev.filter(n => n.id !== nodeId);
          } else {
            return [...prev, nodeObj];
          }
        });
      }
    }

    if (edges.length > 0) {
      setSelectedEdges(prev => {
        const newSet = new Set(prev);
        edges.forEach(edgeId => {
          if (newSet.has(edgeId)) {
            newSet.delete(edgeId);
            const edgeObj = graphData.edges.get(edgeId);
            graphData.edges.update({
              id: edgeId,
              width: 1,
              color: {
                color: edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
              },
            });
          } else {
            newSet.add(edgeId);
            graphData.edges.update({ id: edgeId, width: 5, color: { color: "white" } });
          }
        });
        return Array.from(newSet);
      });
    }
  };

  return (
    <>
      <div id="graph-container" className="graph-container" />

      {graphData && showNodeList && (
        <ScienceAllNodesList nodes={graphData.nodes.get()} hoveredNode={hoveredNode} />
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
