// components/HistoryTable.jsx
import React, { useEffect } from "react";
import { getGameHistory } from "../../clientServerHub";
import "./Styles/HistoryTableStyles.css";

export const HistoryTable = ({ matrixUuid, planetColor, history, setHistory }) => {


  useEffect(() => {
    (async () => {
      try {
        const res = await getGameHistory(matrixUuid);
        setHistory(res.history || []);
      } catch (e) {
        console.error("History load error:", e);
      }
    })();
  }, [matrixUuid]);

  if (!history.length)
    return <p className="history-no-games">Нет сыгранных партий</p>;

  return (
    <div className="history-table-container">
      <table className="history-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Итоговый счёт</th>
            <th>Ходы</th>
          </tr>
        </thead>
        <tbody>
          {history.map((g, i) => (
            <tr key={i}>
              <td>{new Date(g.timestamp).toLocaleString()}</td>
              <td style={{ fontWeight: "bold", color: planetColor }}>
                {g.final_score}
              </td>
              <td>
                {g.turns.map((turn, idx) => (
                  <div key={idx} style={{ marginBottom: "5px" }}>
                    Ход {idx + 1}: {turn.nodes.join(", ")}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};