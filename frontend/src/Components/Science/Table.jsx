import React from "react";
import { useCustomStates } from "../../CustomStates";

export const MovesTable = () => {
  const { prevScores, containerRef } = useCustomStates();

  
  return (
    <div id="moves-table-alignment-div">
      <h5 className="moves-table-title">Данные о ходах и очках</h5>
      <div
        ref={containerRef}
        className="moves-table-container"
        style={{ overflowY: prevScores.length > 7 ? "auto" : "hidden" }}
      >
        <table className="moves-table">
          <thead>
            <tr>
              <th className="moves-table-header" rowSpan="2">Ходы</th>
              <th className="moves-table-header" colSpan="2">Начисленные очки</th>
            </tr>
            <tr>
              <th className="moves-table-header">За 1 ход</th>
              <th className="moves-table-header">Накопительные</th>
            </tr>
          </thead>
          <tbody>
            {prevScores.length > 0 ? (
              prevScores.map((cumulative, index) => {
                const prevCumulative = index > 0 ? prevScores[index - 1] : 0;
                const perMove = (cumulative - prevCumulative).toFixed(2);

                return (
                  <tr
                    key={index}
                    className={`moves-table-row ${index === prevScores.length - 1 ? "moves-table-last-row" : ""}`}
                  >
                    <td className="moves-table-cell">
                      {index === prevScores.length - 1 ? "🏁 " : ""}
                      {`Move ${index + 1}`}
                    </td>
                    <td className="moves-table-cell">{perMove}</td>
                    <td className="moves-table-cell">{cumulative.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr className="moves-table-row">
                <td className="moves-table-cell">Move 1</td>
                <td className="moves-table-cell">None</td>
                <td className="moves-table-cell">None</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};