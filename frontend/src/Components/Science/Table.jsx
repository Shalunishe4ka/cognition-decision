import React from "react";

const MovesTableHeader = [
  { title: "Ходы", key: "Moves", width: "150px" },
  {
    title: "Начисленные очки",
    key: "Scores",
    width: "300px",
    subHeaders: [
      { title: "За 1 ход", key: "PerMove", width: "150px" },
      { title: "Накопительные", key: "Cumulative", width: "150px" },
    ],
  },
];

export const MovesTable = ({ data }) => {
  const defaultData = [
    { Moves: "Ход 1", PerMove: "None" },
    { Moves: "Ход 2", PerMove: "None" },
    { Moves: "Ход 3", PerMove: "None" },
    { Moves: "Ход 4", PerMove: "None" },
    { Moves: "Ход 5", PerMove: "None" },
    { Moves: "Ход 6", PerMove: "None" },
    { Moves: "Ход 7", PerMove: "None" },
  ];

  // Проверка на непустой массив
  const hasData = Array.isArray(data) && data.length > 0;

  const tableData = hasData
    ? data.map((item, index) => ({
        Moves: `Ход ${index + 1}`,
        PerMove: "None",  // можно адаптировать позже
      }))
    : defaultData;

  const calculatedData = tableData.map((row, index) => ({
    ...row,
    Cumulative: "None",
  }));

  return (
    <div id="synthetic-table-container">
      <h5 style={{ color: "#ffd700", textAlign: "center", marginBottom: "10px" }}>
        Данные о ходах и очках
      </h5>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "400px" }}>
          <thead>
            <tr>
              <th
                style={{
                  width: MovesTableHeader[0].width,
                  fontSize: "18px",
                  textAlign: "center",
                  border: "1px solid white",
                  padding: "8px",
                }}
                rowSpan="2"
              >
                {MovesTableHeader[0].title}
              </th>
              <th
                style={{
                  width: MovesTableHeader[1].width,
                  fontSize: "18px",
                  textAlign: "center",
                  border: "1px solid white",
                  padding: "8px",
                }}
                colSpan={MovesTableHeader[1].subHeaders.length}
              >
                {MovesTableHeader[1].title}
              </th>
            </tr>
            <tr>
              {MovesTableHeader[1].subHeaders.map((subHeader, index) => (
                <th
                  key={index}
                  style={{
                    width: subHeader.width,
                    fontSize: "16px",
                    textAlign: "center",
                    border: "1px solid white",
                    padding: "8px",
                  }}
                >
                  {subHeader.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calculatedData.map((row, index) => (
              <tr key={index}>
                <td
                  style={{
                    width: MovesTableHeader[0].width,
                    border: "1px solid white",
                    padding: "8px",
                  }}
                >
                  {row.Moves}
                </td>
                <td
                  style={{
                    width: MovesTableHeader[1].subHeaders[0].width,
                    border: "1px solid white",
                    padding: "8px",
                  }}
                >
                  {row.PerMove}
                </td>
                <td
                  style={{
                    width: MovesTableHeader[1].subHeaders[1].width,
                    border:
                      index === calculatedData.length - 1
                        ? "2px solid red"
                        : "1px solid white",
                    padding: "8px",
                    fontWeight:
                      index === calculatedData.length - 1 ? "bold" : "normal",
                    fontSize:
                      index === calculatedData.length - 1 ? "1.2rem" : "",
                  }}
                >
                  {row.Cumulative}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
