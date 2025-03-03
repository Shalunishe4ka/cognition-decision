import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartPage.css";

const ButtonGroup = () => {
  const navigate = useNavigate();
  return (
    <div className="button-container">
      <button className="play-button" onClick={() => navigate("/challengecomponent")}>
        <Link className="play-link" to={"/challengecomponent"}>
          Play
        </Link>
      </button>
      <button className="info-button" onClick={() => navigate("/rules")}>
        <Link className="rules-link" to={"/rules"}>
          Info</Link>
      </button>
    </div>
  );
};

export default ButtonGroup;
