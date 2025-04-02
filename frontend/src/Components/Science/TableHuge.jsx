// TableHuge.jsx
import React from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const TableHeader1 = [
  { title: "Расчётные данные", width: "300px", colSpan: 2 },
  { title: "Ваш игровой результат", width: "300px", colSpan: 2 },
];

const TableHeader2 = [
  { title: "Вершина", key: "ID", width: "150px", height: "20px" },
  { title: "Счёт", key: "Score1", width: "240px", height: "20px" },
  { title: "Вершина", key: "S", width: "150px", height: "20px" },
  { title: "Счёт", key: "Score2", width: "240px", height: "20px" },
];

export const TableHuge = ({ data }) => {
  // Define default data when backend data is not available
  const defaultData = [
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
  ];

  const tableData = data || defaultData;

  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: "ascending",
  });
  const [hoveredSortButton, setHoveredSortButton] = React.useState(null);

  const onSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Calculate sums
  const sums = tableData.reduce(
    (acc, row) => {
      acc.Score1 += parseFloat(row.Score1) || 0; // Преобразуем к числу или добавляем 0, если преобразование не удалось
      acc.S += parseFloat(row.S) || 0;
      acc.Score2 += parseFloat(row.Score2) || 0;
      return acc;
    },
    { Score1: 0, S: 0, Score2: 0 }
  );

  return (
    <div id="huge-table-alignment-div">
      <h5>
        Step 2: Сравним Ваши результаты с расчётными
      </h5>
      <h2 id="huge-table-name">Результаты</h2>
      <div className="huge-table-container">
        <table>
          <thead>
            {/* Первая строка заголовков */}
            <tr>
              {TableHeader1.map((header, index) => (
                <th
                  key={index}
                  colSpan={header.colSpan}
                  style={{ width: header.width, fontSize: "18px" }}
                >
                  {header.title}
                </th>
              ))}
            </tr>
            {/* Вторая строка заголовков */}
            <tr>
              {TableHeader2.map((header, index) => (
                <th
                  key={index}
                  style={{
                    width: header.width,
                    height: header.height,
                    position: "relative",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                  onMouseEnter={() => setHoveredSortButton(index)}
                  onMouseLeave={() => setHoveredSortButton(null)}
                  onClick={() => onSort(header.key)}
                >
                  {header.title}
                  {(hoveredSortButton === index ||
                    sortConfig.key === header.key) &&
                    (sortConfig.key === header.key &&
                      sortConfig.direction === "ascending" ? (
                      <KeyboardArrowDownIcon
                        style={{ marginLeft: "5px" }}
                      />
                    ) : (
                      <KeyboardArrowUpIcon
                        style={{ marginLeft: "5px" }}
                      />
                    ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Строки с данными */}
            {sortedData.map((row, index) => (
              <tr key={index} style={{ fontSize: "18px" }}>
                <td>{row.ID}</td>
                <td>{row.Score1}</td>
                <td>{row.S}</td>
                <td>{row.Score2}</td>
              </tr>
            ))}
            {/* Последняя строка с символом суммы */}
            <tr style={{ fontSize: "18px" }}>
              <td>Σ</td>
              <td>{sums.Score1.toFixed(4) || "None"}</td>
              <td>{sums.S.toFixed(4) || "None"}</td>
              <td>{sums.Score2.toFixed(4) || "None"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
