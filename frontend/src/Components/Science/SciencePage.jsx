import { useEffect } from "react";
import { useCustomStates } from "../../CustomStates";
import { useLocation, useParams } from "react-router-dom";
import {
  getMatrixByUUID,
  fetchScienceDataByUUID,
  logScienceQuery,
} from "../../clientServerHub";
import { MovesTable } from "./Table";
import { TableHuge } from "./TableHuge";
import { TableSmall } from "./TableSmall";
import { ScienceGraphComponent } from "./ScienceGraphComp";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";
import "./SciencePage.css";
import { Conditions } from "./Conditions";
import { SciencePageButtons } from "./SciencePageButtons";
import { ScienceStopWatchContainer } from "./ScienceStopWatchContainer";
import CatAnimation from "../Cat/CatAnimation";

export const SciencePage = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const planetColor = location.state?.planetColor;
  const planetImg = location.state?.planetImg;

  const {
    smallTableData,
    setSmallTableData,
    hugeTableData,
    setHugeTableData,
    syntheticData,
    setSyntheticData,
    matrixInfo,
    setMatrixInfo,
    isLoading,
    setIsLoading,
    error,
    setError,
    showCat,
    setShowCat,
    currentTime,
    catAnimationLaunched,
    setCatAnimationLaunched,
    isRunning,
    maxTime,
  } = useCustomStates();

  const {
    graphData,
    setGraphData,
    setMatrixInfo: setMatrixCtxInfo,
    userUuid,
  } = useCustomStates();

  // Получение данных матрицы
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        setIsLoading(true);
        const data = await getMatrixByUUID(uuid);
        setMatrixInfo(data);
        setMatrixCtxInfo(data);
        setGraphData({ nodes: data.nodes, edges: data.edges });
        setError(null);
      } catch (err) {
        console.error("Matrix load error:", err);
        setError("Ошибка загрузки матрицы");
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) fetchMatrix();
    // eslint-disable-next-line
  }, [uuid]);

  // Получение аналитических данных (science)
  useEffect(() => {
    const fetchScience = async (matrixUUID) => {
      try {
        setIsLoading(true);
        // console.log("Запрос science данных для UUID:", matrixUUID);

        const [scienceData] = await Promise.all([
          fetchScienceDataByUUID(matrixUUID),
          userUuid
            ? logScienceQuery(matrixUUID, userUuid)
            : Promise.resolve(null),
        ]);

        // console.log("Получены scienceData:", scienceData);

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
          Score2: "None",
        }));

        setSmallTableData(small);
        setHugeTableData(huge);
        setSyntheticData(scienceData.synthetic_data ?? []);
        setError(null);
      } catch (err) {
        console.error("Ошибка загрузки scienceData:", err);
        setError("Ошибка загрузки аналитических данных");
      } finally {
        setIsLoading(false);
      }
    };

    const matrixUUID = matrixInfo?.matrix_info?.uuid;
    if (matrixUUID) fetchScience(matrixUUID);
    // eslint-disable-next-line
  }, [matrixInfo, userUuid]);

  useEffect(() => {
    const halfTime = Math.floor(maxTime / 2);

    if (
      (currentTime === 30 ||
        currentTime === halfTime ||
        currentTime === (maxTime - 60)) &&
      !catAnimationLaunched
    ) {
      setShowCat(true);
      setCatAnimationLaunched(true);
    }
  }, [currentTime, catAnimationLaunched, maxTime]);


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

        {isLoading ? (
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
            <h5
              style={{ color: "#ffd700", height: "48px", fontSize: "1.25rem" }}
            >
              Step 3: Сыграйте с нашими данными!
            </h5>
            <div className="graph-section">
              {graphData && <ScienceGraphComponent uuid={uuid} />}
              <ScienceStopWatchContainer planetColor={planetColor} />
              <MovesTable data={syntheticData} />
              {showCat && (
                <div
                  style={{
                    position: "fixed",
                    top: "70%",
                    paddingBottom: "100px",
                  }}
                >
                  <CatAnimation
                    triggerAnimation={true}
                    stopAtX={800}
                    onAnimationEnd={() => {
                      setShowCat(false);           // скрыть кота
                      setCatAnimationLaunched(false); // разрешить повторный запуск
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
