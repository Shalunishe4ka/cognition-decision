import React, { useEffect, useRef } from 'react'
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import { AllNodesList } from './AllNodeList';
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
  networkRef, lastIndex, hoveredNode, selectedNodes,
  handleClear, handleMakeMove, showNodeList, handleClearEdges,
  setIsNetworkReady,
}) => {
  const localNetworkRef = useRef(null);


  // 1) Собираем данные (nodes/edges) в DataSet
  useEffect(() => {
    if (matrixInfo) {
      const edges = matrixInfo.edges;
      const oldnodes = matrixInfo.nodes;
      const nodesMap = new Map();
      const nodesDataSet = new DataSet();
      const edgesDataSet = new DataSet();

      edges.forEach(({ from, to, value }) => {
        if (value !== 0) {
          const fromId = from;
          const toId = to;

          // Узел-источник
          if (oldnodes[fromId - 1]) {
            if (!nodesMap.has(fromId)) {
              const isDisabled = disabledNodes.includes(fromId);
              nodesMap.set(fromId, {
                id: fromId,
                label: `${fromId}`,
                title: oldnodes[fromId - 1].name,
                description: oldnodes[fromId - 1].description,
                color: { background: isDisabled ? "gray" : nodeColor },
                font: { size: isDisabled ? 14 : 16 },
              });
              nodesDataSet.add(nodesMap.get(fromId));
            }
          }

          // Узел-приёмник
          if (oldnodes[toId - 1]) {
            if (!nodesMap.has(toId)) {
              const isDisabled = disabledNodes.includes(toId);
              const nodeObj = {
                id: toId,
                label: `${toId}`,
                title: oldnodes[toId - 1].name,
                description: oldnodes[toId - 1].description,
                color: { background: isDisabled ? "gray" : nodeColor },
                font: { size: isDisabled ? 14 : 16 },
              };
              if (oldnodes[toId - 1].target === 1) {
                nodeObj.color = { background: "gold" };
                nodeObj.font = { size: 25 };
              }
              nodesMap.set(toId, nodeObj);
              nodesDataSet.add(nodeObj);
            }
          }

          // Рёбра
          try {
            const edgeId = `${fromId}${toId}`;
            edgesDataSet.add({
              id: edgeId,
              from: fromId,
              to: toId,
              rawValue: value,
              width: 1,
              title: `При увеличении ${oldnodes[fromId - 1].name} ${value > 0 ? "увеличивается" : "уменьшается"
                } ${oldnodes[toId - 1].name} на ${value}`,
              label: value.toString(),
              smooth: { type: "continues", roundness: edgeRoundness },
              color: {
                color: value > 0 ? positiveEdgeColor : negativeEdgeColor,
              },
            });
          } catch (e) {
            console.log(e);
          }
        }
      });

      setGraphData({ nodes: nodesDataSet, edges: edgesDataSet });
    }
  }, [
    matrixInfo,
    nodeColor,
    positiveEdgeColor,
    negativeEdgeColor,
    edgeRoundness,
    disabledNodes,
    setGraphData,
  ]);

  // 2) Подсвечиваем выбранные рёбра
  useEffect(() => {
    if (!graphData || !graphData.edges) return;

    selectedEdges.forEach((edgeId) => {
      try {
        graphData.edges.update({
          id: edgeId,
          width: 5,
          color: { color: "white" },
        });
      } catch (err) {
        console.warn(`Ошибка обновления выделенного ребра ${edgeId}:`, err);
      }
    });

    try {
      graphData.edges.forEach((edge) => {
        if (!selectedEdges.includes(edge.id)) {
          graphData.edges.update({
            id: edge.id,
            width: 1,
            color: {
              color: edge.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
            },
          });
        }
      });
    } catch (err) {
      console.warn("Ошибка при обходе рёбер:", err);
    }
  }, [selectedEdges, graphData, positiveEdgeColor, negativeEdgeColor]);

  // 3) Инициализация/рендер графа
  useEffect(() => {
    if (graphData) {
      const container = document.getElementById("graph-container");
      const options = {
        edges: {
          smooth: { type: "curvedCW", roundness: edgeRoundness },
          scaling: {
            min: 1,
            max: 1,
            label: {
              enabled: true,
              min: 11,
              max: 11,
              maxVisible: 55,
              drawThreshold: 5,
            },
          },
          arrows: { to: true },
          font: { size: 18, align: "horizontal", color: "white" },
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
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 25,
          },
        },
        nodes: {
          shape: "circle",
          size: nodeSize,
          font: {
            size: 14,
            color: "white",
            align: "center",
          },
          borderWidth: 2,
          borderWidthSelected: 4,
        },
        interaction: {
          hover: true,
          tooltipDelay: 300,
          multiselect: true,
        },
      };

      // Уничтожаем предыдущий инстанс, если был
      if (localNetworkRef.current) {
        localNetworkRef.current.destroy();
      }

      // Создаём сеть
      const newNetwork = new Network(container, graphData, options);
      // Сохраняем ссылку
      localNetworkRef.current = newNetwork;
      if (networkRef) {
        networkRef.current = newNetwork;
      }

      // 🔥 Устанавливаем флаг готовности сети
      if (setIsNetworkReady) {
        console.log("🧱 Сеть создана, устанавливаем isNetworkReady = true");
        setIsNetworkReady(true);
      }
      // События
      newNetwork.on("click", handleNodeClick);
      newNetwork.on("hoverNode", (event) => {
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
          (id) => !Object.keys(lockedNodes).includes(id)
        );
        newNetwork.setSelection({
          nodes: selectableNodes,
          edges: params.edges,
        });
      });
    }
    // eslint-disable-next-line
  }, [graphData, edgeRoundness, physicsEnabled, nodeSize]);

  // 4) Клик по узлам/рёбрам
  const handleNodeClick = (event) => {
    const clickedNodeIds = event.nodes;
    const clickedEdgeIds = event.edges;
    if (clickedNodeIds.length === 1) {
      const clickedNodeId = clickedNodeIds[0];
      if (!lockedNodes[clickedNodeId] && !disabledNodes.includes(clickedNodeId)) {
        setSelectedNodes((prev) => {
          if (prev.includes(clickedNodeId)) {
            return prev.filter((id) => id !== clickedNodeId);
          } else {
            return [...prev, clickedNodeId];
          }
        });
      }
    }
    if (clickedEdgeIds.length > 0) {
      setSelectedEdges((prev) => {
        const newSelected = new Set(prev);
        clickedEdgeIds.forEach((edgeId) => {
          if (newSelected.has(edgeId)) {
            newSelected.delete(edgeId);
            const edgeObj = graphData.edges.get(edgeId);
            graphData.edges.update({
              id: edgeId,
              width: 1,
              color: {
                color: edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
              },
            });
          } else {
            newSelected.add(edgeId);
            graphData.edges.update({
              id: edgeId,
              width: 5,
              color: { color: "white" },
            });
          }
        });
        return Array.from(newSelected);
      });
    }
  };



  return (
    <>
      {graphData && (
        <div
          id="graph-container"
          className="graph-container"
        />
      )}
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
        <AllNodesList nodes={graphData.nodes.get()} hoveredNode={hoveredNode} />
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
