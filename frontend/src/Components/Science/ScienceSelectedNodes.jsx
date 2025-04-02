import React from 'react';
import { Button } from 'react-bootstrap';
import { useCustomStates } from '../../CustomStates';

export const ScienceSelectedNodesList = ({
  selectedNodes,
  hoveredNode,
  lastIndex,
  handleClear,
  handleMakeMove,
}) => {
  // Получаем graphData из контекста, чтобы найти информацию по узлам
  const { graphData } = useCustomStates();

  return (
    <div className="selected-nodes-list">
      <h2>Выбранные вершины:</h2>
      <ol className="selected-list">
        {selectedNodes.map((nodeId, index) => {
          // Ищем данные узла по его ID через DataSet
          const nodeData =
            graphData && graphData.nodes && typeof graphData.nodes.get === 'function'
              ? graphData.nodes.get(nodeId)
              : null;
          return (
            <li
              key={`${nodeId}-${lastIndex}-${index}`}
              className={`selected-item ${hoveredNode === nodeId ? 'highlighted' : ''}`}
            >
              {nodeId} {nodeData && nodeData.title ? ' — ' : ''} 
              <strong>{nodeData ? nodeData.title : ''}</strong>
            </li>
          );
        })}
      </ol>
      <div className="button-row">
        <Button variant="danger" onClick={handleClear}>
          Очистить
        </Button>
        <Button variant="success" onClick={handleMakeMove}>
          Сделать ход
        </Button>
      </div>
    </div>
  );
};
