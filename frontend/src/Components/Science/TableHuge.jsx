// TableHuge.jsx


const TableHeader1 = [
  { title: "Calculated data (by impact)", width: "300px", colSpan: 2 },
  { title: "Your game results", width: "300px", colSpan: 2 },
];

const TableHeader2 = [
  { title: "Vertex", key: "ID", width: "150px", height: "20px" },
  { title: "Score", key: "Score1", width: "240px", height: "20px" },
  { title: "Vertex", key: "S", width: "150px", height: "20px" },
  { title: "Score", key: "Score2", width: "240px", height: "20px" },
];

export const TableHuge = ({ data }) => {
  const defaultData = [
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
    { ID: "None", Score1: "None", S: "None", Score2: "None" },
  ];

  const tableData = data || defaultData;

  const sums = tableData.reduce(
    (acc, row) => {
      acc.Score1 += parseFloat(row.Score1) || 0;
      acc.S += parseFloat(row.S) || 0;
      acc.Score2 += parseFloat(row.Score2) || 0;
      return acc;
    },
    { Score1: 0, S: 0, Score2: 0 }
  );

  return (
    <div id="huge-table-alignment-div">
      <h5 style={{ fontSize: "1.25rem" }}>
        Step 2: Compare your results with the calculated ones
      </h5>
      <h2 id="huge-table-name">Results</h2>
      <div className="huge-table-container">
        <table>
          <thead>
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
            <tr>
              {TableHeader2.map((header, index) => (
                <th
                  key={index}
                  style={{
                    width: header.width,
                    height: header.height,
                    fontSize: "18px",
                    textAlign: "center",
                  }}
                >
                  {header.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} style={{ fontSize: "18px" }}>
                <td>{row.ID}</td>
                <td>{row.Score1}</td>
                <td>{row.S}</td>
                <td>{row.Score2}</td>
              </tr>
            ))}
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
