import React, { useEffect, useRef } from 'react';

export const AllNodesList = ({ nodes, hoveredNode }) => {
  const activeNodeRef = useRef(null);

  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [hoveredNode]);

  return (
    <div className="node-list-container">
      <h4>Все узлы:</h4>
      <ol className="node-list">
        {nodes.map((node) => (
          <li
            key={node.id}
            ref={hoveredNode === node.id ? activeNodeRef : null}
            className={`node-item ${hoveredNode === node.id ? 'highlighted' : ''}`}
          >
            {node.id} — {node.title}
          </li>
        ))}
      </ol>
    </div>
  );
};
