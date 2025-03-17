// GraphPageUUID.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getMatrixByUUID } from "../Solar/ModalWindowCards/clientServerHub";
import GraphComponent from "./GraphComponent";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText"
import "./Styles/GraphControls.css"
import "./Styles/GraphComponent.css"
import "./Styles/MovesSidebar.css"

export default function GraphPageUUID() {
  const { uuid } = useParams();
  const [matrixInfo, setMatrixInfo] = useState(null);
  const location = useLocation();
  const selectedPlanet = location.state?.selectedPlanet || null;

  useEffect(() => {
    if (!uuid) return;
    getMatrixByUUID(uuid)
      .then((data) => setMatrixInfo(data))
      .catch((err) => console.error("Ошибка загрузки матрицы:", err));
  }, [uuid]);

  if (!matrixInfo) return <div>Загрузка графа...</div>;

  return (

    <main>
      <ChallengeYourMindText />
      <GraphComponent
        matrixInfo={matrixInfo}
        selectedPlanet={selectedPlanet}
        uuid={uuid}
      />
    </main>

  );
}
