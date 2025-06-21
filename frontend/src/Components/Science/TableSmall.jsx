// TableSmall.jsx
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const TableHeader = [
  { title: "ID", key: "ID", width: "75px", height: "75px" },
  {
    title: "Model node response to impact",
    key: "Response",
    width: "170px",
    height: "75px",
  },
  {
    title: "Node impact strength",
    key: "Impact",
    width: "200px",
    height: "75px",
  },
  {
    title: "Weighted node response",
    key: "Eff_in",
    width: "120px",
    height: "75px",
  },
  {
    title: "Weighted node impact",
    key: "Control_in",
    width: "120px",
    height: "75px",
  },
];

export const TableSmall = ({ data }) => {
  const tableData = data;

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

  return (
    <div id="small-table-alignment-div">
      <h5 style={{ color: "#ffd700", height: "48px", fontSize: "1.25rem" }}>
        Step 1: Determine each node’s impact strength using the{" "}
        <a href="/algorithm">Algorithm</a>
      </h5>

      <h2 id="small-table-name">
        The optimized responses and impacts computed by the{" "}
        <a href="https://arxiv.org">algorithm</a>
      </h2>

      <div className="small-table-container">
        <table>
          <thead>
            <tr>
              {TableHeader.map((header, index) => (
                <th
                  key={index}
                  style={{
                    width: header.width,
                    height: header.height,
                    position: "relative",
                    cursor: "pointer",
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
                      <KeyboardArrowDownIcon />
                    ) : (
                      <KeyboardArrowUpIcon />
                    ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                {TableHeader.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      width: header.width,
                      fontSize: "18px",
                    }}
                  >
                    {row[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
