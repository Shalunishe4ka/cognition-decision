import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import StartPage from "./Components/StartPage/StartPage";
import Header from "./Components/Header/Header";
import ChallengeComponent from "./Components/AldafiraWelcome/ChallengeComponent";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/challengecomponent" element={<ChallengeComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
