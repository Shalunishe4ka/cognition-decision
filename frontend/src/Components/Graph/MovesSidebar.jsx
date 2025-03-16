// MovesSidebar.jsx
import React from "react";

export default function MovesSidebar({
  selectedNodes,
  clearSelection,
  makeMove,
  disabledNodes,
  matrixInfo,
  score
}) {
  return (
    <div className="moves-sidebar">
      <h3 className="moves-header">Selected Nodes</h3>
      {selectedNodes.length > 0 ? (
        <ul className="moves-list">
          {selectedNodes.map((nodeId) => (
            <li key={nodeId}>{nodeId}</li>
          ))}
        </ul>
      ) : (
        <p>No selection</p>
      )}
      <button onClick={clearSelection}>Clear</button>
      <button onClick={() => makeMove(15)}>Make Move (Fake +15)</button>
    </div>
  );
}
