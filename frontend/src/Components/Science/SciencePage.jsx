import { useEffect, useState } from "react";
import { useCustomStates } from "../Graph/CustomStates"
import { useLocation, useParams } from 'react-router-dom';
import { getMatrixByUUID, fetchScienceDataByUUID, logScienceQuery } from "../../clientServerHub";
import { SyntheticTable } from "./Table";
import { TableHuge } from "./TableHuge";
import { TableSmall } from "./TableSmall"
import { ScienceGraphComponent } from "./ScienceGraphComp"
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText"
import "./SciencePage.css"

export const SciencePage = () => {
  const { uuid } = useParams();
  const [smallTableData, setSmallTableData] = useState([]);
  const [hugeTableData, setHugeTableData] = useState([]);
  const [syntheticData, setSyntheticData] = useState([]);
  const [matrixInfo, setMatrixInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const planetColor = location.state?.planetColor;
  console.log(planetColor)
  const planetImg = location.state?.planetImg;

  const {
    graphData, setGraphData,
    networkRef, setMatrixInfo: setMatrixCtxInfo,
    userUuid
  } = useCustomStates();

  // Загрузка матрицы
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const data = await getMatrixByUUID(uuid);
        setMatrixInfo(data);
        setMatrixCtxInfo(data);
        setGraphData({ nodes: data.nodes, edges: data.edges });
        setError(null);
      } catch (err) {
        console.error("Matrix load error:", err);
        setError("Ошибка загрузки матрицы");
        setLoading(false);
      }
    };

    if (uuid) fetchMatrix();
  }, [uuid]);

  // Загрузка science данных
  useEffect(() => {
    const fetchScience = async () => {
      try {
        setLoading(true);
        const matrixUUID = matrixInfo?.matrix_info?.matrix_uuid;

        if (!matrixUUID) return;

        const [scienceData] = await Promise.all([
          fetchScienceDataByUUID(matrixUUID),
          userUuid && logScienceQuery(matrixUUID, userUuid)
        ]);

        // Обработка данных для таблиц
        const small = scienceData.x.map((val, i) => ({
          ID: i + 1,
          Response: val?.toFixed(4) ?? "N/A",
          Impact: scienceData.u[i]?.toFixed(4) ?? "N/A",
          Eff_in: scienceData.normalized_x[i]?.toFixed(4) ?? "N/A",
          Control_in: scienceData.normalized_u[i]?.toFixed(4) ?? "N/A",
        }));

        const huge = scienceData.sorted_true_seq?.map(([id, val]) => ({
          ID: id,
          Score1: val?.toFixed(4) ?? "N/A",
          S: "None",
          Score2: "None"
        })) ?? [];

        setSmallTableData(small);
        setHugeTableData(huge);
        setSyntheticData(scienceData.synthetic_data || []);
        setError(null);
      } catch (err) {
        console.error("Science data error:", err);
        setError("Ошибка загрузки аналитических данных");
      } finally {
        setLoading(false);
      }
    };

    if (matrixInfo) fetchScience();
  }, [matrixInfo, userUuid]);

  return (
    <div className="science-page">
      <div className="regulator">
      <ChallengeYourMindText />
      </div>
      <div>
        {error && <div className="error-banner">{error}</div>}
        <div className="planet-creds-div">
          <img style={{ width: "120px", height: "120px", borderRadius: "15px" }} src={planetImg} />
          <h1 className="science-page-title" style={{ color: planetColor }}>
            {matrixInfo?.matrix_info?.matrix_name || "Загрузка модели..."}
          </h1>
       </div>
        
        
        {loading ? (
          <div className="loading-overlay">
            <div className="loader" />
            <p>Загрузка данных...</p>
          </div>
        ) : (
          <>
            <div className="tables-section">
              <TableSmall data={smallTableData} />
              <TableHuge data={hugeTableData} />
            </div>
            <div className="graph-section">
              {graphData && <ScienceGraphComponent uuid={uuid} />}
              {syntheticData.length > 0 && <SyntheticTable data={syntheticData} />}
            </div>

          </>
        )}
      </div>
    </div>
  );
};