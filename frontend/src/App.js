import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import StartPage from "./Components/StartPage/StartPage";
import Header from "./Components/Header/Header";
import ChallengeComponent from "./Components/AldafiraWelcome/ChallengeComponent";
import { useState } from "react";
import SolarSystem from "./Components/Solar/SolarSystem";
import { GraphMainLayout } from "./Components/Graph/GraphMainLayout";
import { SignUp } from "./Components/UserCreds/SignUp";
import { SignIn } from "./Components/UserCreds/SignIn";
import { CustomStatesProvider } from "./CustomStates";
import { SciencePage } from "./Components/Science/SciencePage";
import { AlgoPage } from "./Components/Science/AlgoPage";
import { RulesPage } from "./Components/RulesPage/RulesPage";
import { GlobalAudioManager } from "./Components/Audio";


function App() {
  const [headerShow, setHeaderShow] = useState(true);



  return (
    <CustomStatesProvider>
      {" "}
      {/* 🚀 ОБЁРТКА ЗДЕСЬ */}
      <Router>
        <Header headerShow={headerShow} />
        <Routes>
          <Route
            path="/"
            element={<StartPage setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/challengecomponent"
            element={<ChallengeComponent setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/solar"
            element={<SolarSystem setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/science/:uuid"
            element={<SciencePage setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/matrix_uuid/:uuid"
            element={<GraphMainLayout setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/sign-up"
            element={<SignUp setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/sign-in"
            element={<SignIn setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/algorithm"
            element={<AlgoPage setHeaderShow={setHeaderShow} />}
          />
          <Route
            path="/rules"
            element={<RulesPage setHeaderShow={setHeaderShow} />}
          />
        </Routes>
      </Router>
      {/* 🎵 Воспроизведение фоновой музыки */}
      <GlobalAudioManager />
    </CustomStatesProvider>
  );
}

export default App;
