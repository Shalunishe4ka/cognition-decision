import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import { getMatrixByUUID, fetchScienceDataByUUID } from "../../clientServerHub";

export const ScienceGraphComponent = ({ uuid }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [matrixInfo, setMatrixInfo] = useState(null);


  // Загружаем матрицу по uuid
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const data = await getMatrixByUUID(uuid);
        setMatrixInfo(data);
      } catch (err) {
        console.error("Ошибка загрузки матрицы:", err);
      }
    };
    fetchMatrix();
  }, [uuid]);

  // Инициализация графа
  useEffect(() => {
    if (!matrixInfo || !containerRef.current) return;

    const nodesDataSet = new DataSet();
    const edgesDataSet = new DataSet();

    const { nodes, edges } = matrixInfo;

    nodes.forEach(node => {
      nodesDataSet.add({
        id: node.id,
        label: `${node.id}`,
        title: node.name,
        color: node.target === 1 ? "gold" : "#0b001a",
      });
    });

    edges.forEach(edge => {
      if (edge.value !== 0) {
        edgesDataSet.add({
          id: `${edge.from}-${edge.to}`,
          from: edge.from,
          to: edge.to,
          label: edge.value.toString(),
          color: { color: edge.value > 0 ? "#00FF00" : "#FF0000" },
          arrows: "to",
          smooth: { type: "curvedCW", roundness: 0.15 },
        });
      }
    });

    const data = { nodes: nodesDataSet, edges: edgesDataSet };
    const options = {
      nodes: { shape: "circle", color: "#0b001a", font: { color: "white" } },
      edges: { font: { size: 12 }, color: { color: "#888" }, smooth: true },
      physics: { enabled: false },
      interaction: { hover: true, tooltipDelay: 300 },
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }
    networkRef.current = new Network(containerRef.current, data, options);
    setGraphData(data);
  }, [matrixInfo]);

  return (
    <div className="science-graph-page">
      <div className="graph-container-science" ref={containerRef} />
    </div>
  );
};
