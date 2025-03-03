import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import StartPage from "./Components/StartPage/StartPage";
import Header from "./Components/Header/Header";
import ChallengeComponent from "./Components/AldafiraWelcome/ChallengeComponent";
import { useState } from "react";
import SolarSystem from "./Components/Solar/SolarSystem";

function App() {
  const [headerShow, setHeaderShow] = useState(true);
  return (
    <Router>
      <Header headerShow={headerShow} />
      <Routes>
        <Route path="/" element={<StartPage setHeaderShow={setHeaderShow}/>} />
        <Route
          path="/challengecomponent"
          element={<ChallengeComponent setHeaderShow={setHeaderShow} />}
        />
        <Route path="/solar" element={<SolarSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
