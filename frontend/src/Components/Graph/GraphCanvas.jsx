// GraphCanvas.jsx
import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";

export default function GraphCanvas({
  matrixInfo,
  selectedNodes,
  setSelectedNodes,
  selectedEdges,
  setSelectedEdges,
  disabledNodes,
  backgroundColor,
  positiveEdgeColor,
  negativeEdgeColor,
  nodeColor,
  physicsEnabled,
  nodeSize,
  edgeRoundness,
  onNodeClick,
  setShowNodeList
}) {
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState(null);

  // 1) Создаём DataSet из matrixInfo
  useEffect(() => {
    if (!matrixInfo?.edges || !matrixInfo?.nodes) return;

    const nodesMap = new Map();
    const nodesDS = new DataSet();
    const edgesDS = new DataSet();
    const oldNodes = matrixInfo.nodes;

    matrixInfo.edges.forEach(({ from, to, value }) => {
      if (value === 0) return;
      // from node
      if (!nodesMap.has(from)) {
        const isDisabled = disabledNodes.includes(from);
        nodesMap.set(from, {
          id: from,
          label: `${from}`,
          color: {
            background: isDisabled ? "gray" : nodeColor
          }
        });
        nodesDS.add(nodesMap.get(from));
      }
      // to node
      if (!nodesMap.has(to)) {
        const isDisabled = disabledNodes.includes(to);
        nodesMap.set(to, {
          id: to,
          label: `${to}`,
          color: {
            background: isDisabled ? "gray" : nodeColor
          }
        });
        nodesDS.add(nodesMap.get(to));
      }
      // edge
      const edgeId = `edge-${from}-${to}`;
      edgesDS.add({
        id: edgeId,
        from,
        to,
        rawValue: value,
        label: value.toString(),
        smooth: {
          type: "curvedCW",
          roundness: edgeRoundness
        },
        color: {
          color: value > 0 ? positiveEdgeColor : negativeEdgeColor
        }
      });
    });

    setGraphData({ nodes: nodesDS, edges: edgesDS });
  }, [
    matrixInfo,
    disabledNodes,
    nodeColor,
    positiveEdgeColor,
    negativeEdgeColor,
    edgeRoundness
  ]);

  // 2) Инициализируем vis.Network
  useEffect(() => {
    if (!graphData) return;
    const container = document.getElementById("graph-container");
    if (!container) return;

    const options = {
      nodes: {
        shape: "circle",
        size: nodeSize,
        font: { size: 14, color: "white" }
      },
      edges: {
        smooth: { type: "curvedCW", roundness: edgeRoundness },
        arrows: { to: true },
        font: { size: 14, color: "white" }
      },
      physics: {
        enabled: physicsEnabled
      },
      interaction: {
        multiselect: true,
        hover: true
      }
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }
    const network = new Network(container, graphData, options);
    networkRef.current = network;
    network.on("hoverNode", function (params) {
      setShowNodeList(true);
    });
    network.on("blurNode", function (params) {
      setShowNodeList(false);
    });
    // Обработчик клика на узлы/рёбра
    network.on("click", (params) => {
      const clickedNodes = params.nodes;
      const clickedEdges = params.edges;
      if (clickedNodes.length === 1) {
        const nodeId = clickedNodes[0];
        // Тогглим
        setSelectedNodes((prev) =>
          prev.includes(nodeId)
            ? prev.filter((id) => id !== nodeId)
            : [...prev, nodeId]
        );
      }
      if (clickedEdges.length > 0) {
        setSelectedEdges((prev) => {
          const newSet = new Set(prev);
          clickedEdges.forEach((edgeId) => {
            if (newSet.has(edgeId)) {
              newSet.delete(edgeId);
            } else {
              newSet.add(edgeId);
            }
          });
          return Array.from(newSet);
        });
      }
    });
  }, [graphData, physicsEnabled, nodeSize, edgeRoundness]);



  return (
    <div
      id="graph-container"
      className="graph-container"
      style={{
        height: "700px",
        width: "90%",
        backgroundColor: backgroundColor
      }}
    />
  );
}
