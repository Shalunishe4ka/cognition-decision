import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import StartPage from "./Components/StartPage/StartPage";
import Header from "./Components/Header/Header";
import ChallengeComponent from "./Components/AldafiraWelcome/ChallengeComponent";
import { useState } from "react";
import SolarSystem from "./Components/Solar/SolarSystem";
import { SignUpPage } from "./Components/UserCredsPage/SignUp/SignUpPage";
import { SignInPage } from "./Components/UserCredsPage/SignIn/SignInPage";

function App() {
  const [headerShow, setHeaderShow] = useState(true);
  return (
    <Router>
      <Header headerShow={headerShow} />
      <Routes>
        <Route path="/" element={<StartPage setHeaderShow={setHeaderShow} />} />
        <Route
          path="/challengecomponent"
          element={<ChallengeComponent setHeaderShow={setHeaderShow} />}
        />
        <Route path="/solar" element={<SolarSystem />} />
        <Route path="/sign-up" element={<SignUpPage setHeaderShow={setHeaderShow}/>} />
        <Route path="/sign-in" element={<SignInPage setHeaderShow={setHeaderShow}/>} />
      </Routes>
    </Router>
  );
}

export default App;
