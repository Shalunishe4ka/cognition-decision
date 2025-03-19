// SyntheticTable.jsx
import React from "react";


const SyntheticTableHeader = [
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

export const SyntheticTable = ({ data }) => {
   // Default data for demonstration
   const defaultData = [
    { Moves: "Ход 1", PerMove: "None" },
    { Moves: "Ход 2", PerMove: "None" },
    { Moves: "Ход 3", PerMove: "None" },
    { Moves: "Ход 4", PerMove: "None" },
    { Moves: "Ход 5", PerMove: "None" },
    { Moves: "Ход 6", PerMove: "None" },
    { Moves: "Ход 7", PerMove: "None" },
  ];

  // Пример адаптации, если данные из бэкенда имеют другую структуру
  const tableData = data
    ? data.map((item, index) => ({
        Moves: `Ход ${index + 1}`,
        PerMove: "None", // Всегда "None" в "За 1 ход"
      }))
    : defaultData;

  // Создаём "накопительные" значения как строку "None"
  const calculatedData = tableData.map((row, index) => ({
    ...row,
    Cumulative: "None",
  }));

  return (
    <div id="synthetic-table-container">
      <h5 style={{ color: "#ffd700", textAlign: "center" }}>
        Данные о ходах и очках
      </h5>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{
                width: SyntheticTableHeader[0].width,
                fontSize: "18px",
                textAlign: "center",
                border: "1px solid white",
                padding: "8px",
              }}
              rowSpan="2"
            >
              {SyntheticTableHeader[0].title}
            </th>
            <th
              style={{
                width: SyntheticTableHeader[1].width,
                fontSize: "18px",
                textAlign: "center",
                border: "1px solid white",
                padding: "8px",
              }}
              colSpan={SyntheticTableHeader[1].subHeaders.length}
            >
              {SyntheticTableHeader[1].title}
            </th>
          </tr>
          <tr>
            {SyntheticTableHeader[1].subHeaders.map((subHeader, index) => (
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
                  width: SyntheticTableHeader[0].width,
                  border: "1px solid white",
                  padding: "8px",
                }}
              >
                {row.Moves}
              </td>
              <td
                style={{
                  width: SyntheticTableHeader[1].subHeaders[0].width,
                  border: "1px solid white",
                  padding: "8px",
                }}
              >
                {row.PerMove}
              </td>
              <td
                style={{
                  width: SyntheticTableHeader[1].subHeaders[1].width,
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
  );
};
