import { useEffect, useState } from "react";
import { useCustomStates } from "../../CustomStates";
import { useLocation, useParams } from 'react-router-dom';
import { getMatrixByUUID, fetchScienceDataByUUID, logScienceQuery } from "../../clientServerHub";
import { MovesTable } from "./Table";
import { TableHuge } from "./TableHuge";
import { TableSmall } from "./TableSmall";
import { ScienceGraphComponent } from "./ScienceGraphComp";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";
import "./SciencePage.css";
import { Conditions } from "./Conditions";
import { SciencePageButtons } from "./SciencePageButtons"
import {StopWatchContainer} from "./StopWatchContainer";

export const SciencePage = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const planetColor = location.state?.planetColor;
  const planetImg = location.state?.planetImg;

  const [smallTableData, setSmallTableData] = useState([]);
  const [hugeTableData, setHugeTableData] = useState([]);
  const [syntheticData, setSyntheticData] = useState([]);
  const [matrixInfo, setMatrixInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    graphData, setGraphData,
    setMatrixInfo: setMatrixCtxInfo,
    userUuid
  } = useCustomStates();

  // Получение данных матрицы
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        setLoading(true);
        const data = await getMatrixByUUID(uuid);
        setMatrixInfo(data);
        setMatrixCtxInfo(data);
        setGraphData({ nodes: data.nodes, edges: data.edges });
        setError(null);
      } catch (err) {
        console.error("Matrix load error:", err);
        setError("Ошибка загрузки матрицы");
      } finally {
        setLoading(false);
      }
    };

    if (uuid) fetchMatrix();
  }, [uuid]);

  // Получение аналитических данных (science)
  useEffect(() => {
    const fetchScience = async (matrixUUID) => {
      try {
        setLoading(true);
        console.log("Запрос science данных для UUID:", matrixUUID);

        const [scienceData] = await Promise.all([
          fetchScienceDataByUUID(matrixUUID),
          userUuid ? logScienceQuery(matrixUUID, userUuid) : Promise.resolve(null)
        ]);

        console.log("Получены scienceData:", scienceData);

        // Обработка данных для маленькой таблицы
        const small = scienceData.x.map((val, i) => ({
          ID: i + 1,
          Response: val?.toFixed(4) ?? "N/A",
          Impact: scienceData.u[i]?.toFixed(4) ?? "N/A",
          Eff_in: scienceData.normalized_x[i]?.toFixed(4) ?? "N/A",
          Control_in: scienceData.normalized_u[i]?.toFixed(4) ?? "N/A",
        }));

        // Обработка данных для большой таблицы
        const huge = (scienceData.sorted_true_seq ?? []).map(([id, val]) => ({
          ID: id,
          Score1: val?.toFixed(4) ?? "N/A",
          S: "None",
          Score2: "None"
        }));

        setSmallTableData(small);
        setHugeTableData(huge);
        setSyntheticData(scienceData.synthetic_data ?? []);
        setError(null);
      } catch (err) {
        console.error("Ошибка загрузки scienceData:", err);
        setError("Ошибка загрузки аналитических данных");
      } finally {
        setLoading(false);
      }
    };

    const matrixUUID = matrixInfo?.matrix_info?.uuid;
    if (matrixUUID) fetchScience(matrixUUID);
  }, [matrixInfo, userUuid]);

  return (
    <div className="science-page">
      <div className="regulator">
        <ChallengeYourMindText />
      </div>

      <div>
        {error && <div className="error-banner">{error}</div>}
        <SciencePageButtons />
        <div className="planet-creds-div">
          <img
            src={planetImg}
            alt="Planet"
            style={{ width: "120px", height: "120px", borderRadius: "15px" }}
          />
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
            <Conditions />
            <div className="tables-section">
              <TableSmall data={smallTableData} />
              <TableHuge data={hugeTableData} />
            </div>

            <div className="graph-section">
              {graphData && <ScienceGraphComponent uuid={uuid} />}
              <StopWatchContainer planetColor={planetColor}/>
              <MovesTable data={syntheticData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
