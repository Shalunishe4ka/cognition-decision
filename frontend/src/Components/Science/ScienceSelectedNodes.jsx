import React from 'react';
import { Button } from 'react-bootstrap';

export const ScienceSelectedNodesList = ({
  selectedNodes,
  hoveredNode,
  lastIndex,
  handleClear,
  handleMakeMove,
}) => {

  return (
    <div className="selected-nodes-list">
      <h2>Выбранные вершины:</h2>
      <ol className="selected-list">
        {selectedNodes.map((nodeObj, index) => (
          <li
            key={nodeObj.id + "-" + lastIndex + "-" + index}
            className={`selected-item ${hoveredNode === nodeObj.id ? 'highlighted' : ''}`}
          >
            {nodeObj.id} — <strong>{nodeObj.title}</strong>
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
