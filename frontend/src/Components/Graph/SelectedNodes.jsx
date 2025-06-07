import React from 'react';
import { Button } from 'react-bootstrap';

export const SelectedNodesList = ({
  selectedNodes,
  hoveredNode,
  lastIndex,
  handleClear,
  handleMakeMove,
}) => {
  return (
    <div className="selected-nodes-list">
      <h2>Выбранные узлы:</h2>
      <ol className="selected-list">
        {selectedNodes.map((nodeId, index) => (
          <li
            key={index + lastIndex}
            className={`selected-item ${hoveredNode === nodeId ? 'highlighted' : ''}`}
          >
            Узел ID: {nodeId}
          </li>
        ))}
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
