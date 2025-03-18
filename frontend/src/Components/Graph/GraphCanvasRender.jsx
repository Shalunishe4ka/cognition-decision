import React, { useEffect, useRef } from 'react'
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";

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
    backgroundColor,

}) => {
    const networkRef = useRef(null);

    // --- Инициализация графа ---
    useEffect(() => {
        if (matrixInfo) {
            const edges = matrixInfo.edges;
            const oldnodes = matrixInfo.nodes;
            const nodes = new Map();
            const nodesDataSet = new DataSet();
            const edgesDataSet = new DataSet();

            edges.forEach(({ from, to, value }) => {
                if (value !== 0) {
                    const fromId = from;
                    const toId = to;

                    // Узел-источник
                    if (oldnodes[fromId - 1]) {
                        if (!nodes.has(fromId)) {
                            const isDisabled = disabledNodes.includes(fromId);
                            nodes.set(fromId, {
                                id: fromId,
                                label: `${fromId}`,
                                title: oldnodes[fromId - 1].name,
                                description: oldnodes[fromId - 1].description,
                                color: { background: isDisabled ? "gray" : nodeColor },
                                font: { size: isDisabled ? 14 : 16 },
                            });
                            nodesDataSet.add(nodes.get(fromId));
                        }
                    }

                    // Узел-приёмник
                    if (oldnodes[toId - 1]) {
                        if (!nodes.has(toId)) {
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
                            nodes.set(toId, nodeObj);
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
                            title: `При увеличении ${oldnodes[fromId - 1].name} ${value > 0 ? "увеличивается" : "уменьшается"} ${oldnodes[toId - 1].name} на ${value}`,
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
    }, [matrixInfo, nodeColor, positiveEdgeColor, negativeEdgeColor, edgeRoundness, disabledNodes]);

    useEffect(() => {
        if (graphData?.edges) {
            selectedEdges.forEach((edgeId) => {
                graphData.edges.update({
                    id: edgeId,
                    width: 5,
                    color: { color: "white" },
                });
            });
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
        }
    }, [selectedEdges, graphData, positiveEdgeColor, negativeEdgeColor]);

    // --- После появления graphData рисуем сеть ---
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
                    font: { size: 24, align: "horizontal" },
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

            if (networkRef.current) {
                networkRef.current.destroy();
            }

            const newNetwork = new Network(container, graphData, options);
            // newNetwork.moveTo({
            //     position: { x: -100, y: -350 },
            //     scale: 0.85,
            //     animation: {
            //         duration: 1000,
            //         easingFunction: "easeInOutQuad",
            //     },
            // });
            newNetwork.on("click", handleNodeClick);
            newNetwork.on("hoverNode", (event) => {
                setHighlightedNode(event.node);
                setShowNodeList(true);
                setHoveredNode(event.node);
                // setCursorPosition({ x: event.pointer.DOM.x, y: event.pointer.DOM.y });
                // if (hoverSoundRef.current) {
                //     hoverSoundRef.current.currentTime = 0;
                //     hoverSoundRef.current.play().catch((err) => {
                //         console.error("Ошибка воспроизведения звука:", err);
                //     });
                // }
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

            networkRef.current = newNetwork;
            // loadCoordinates();
        }
    }, [graphData, edgeRoundness, physicsEnabled, nodeSize]);

    // --- Клики по вершинам/рёбрам ---
    const handleNodeClick = (event) => {
        const clickedNodeIds = event.nodes;
        const clickedEdgeIds = event.edges;
        if (clickedNodeIds.length === 1) {
            const clickedNodeId = clickedNodeIds[0];
            if (!lockedNodes[clickedNodeId] && !disabledNodes.includes(clickedNodeId)) {
                setSelectedNodes((prevSelectedNodes) => {
                    if (prevSelectedNodes.includes(clickedNodeId)) {
                        return prevSelectedNodes.filter((id) => id !== clickedNodeId);
                    } else {
                        return [...prevSelectedNodes, clickedNodeId];
                    }
                });
            }
        }
        if (clickedEdgeIds.length > 0) {
            setSelectedEdges((prevSelectedEdges) => {
                const newSelectedEdges = new Set(prevSelectedEdges);
                clickedEdgeIds.forEach((edgeId) => {
                    if (newSelectedEdges.has(edgeId)) {
                        newSelectedEdges.delete(edgeId);
                        const edgeObj = graphData.edges.get(edgeId);
                        graphData.edges.update({
                            id: edgeId,
                            width: 1,
                            color: {
                                color:
                                    edgeObj.rawValue > 0 ? positiveEdgeColor : negativeEdgeColor,
                            },
                        });
                    } else {
                        newSelectedEdges.add(edgeId);
                        graphData.edges.update({
                            id: edgeId,
                            width: 5,
                            color: { color: "white" },
                        });
                    }
                });
                return Array.from(newSelectedEdges);
            });
        }
    };


    return (
        <>
            {graphData && (
                <div
                    id="graph-container"
                    style={{
                        height: "620px",
                        width: "100%",
                        position: "relative",
                        margin: "0 20px",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: backgroundColor,
                        color: "white",
                        overflow: "hidden",
                        border: "1px solid white",
                        borderRadius: "20px"
                    }}
                ></div>
            )}
        </>
    )
}
