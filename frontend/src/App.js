import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import StartPage from "./Components/StartPage/StartPage";
import Header from "./Components/Header/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<StartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
