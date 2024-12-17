import React from "react";
import { Link } from "react-router-dom";
import "./StartPage.css";

const ButtonGroup = () => {
  return (
    <div className="button-container">
      <Link className="play-link" to={"./ChallengeComponent"}>
        <button className="play-button">Play</button>
      </Link>
      <Link className="rules-link" to={"./rules"}>
        <button className="info-button">Info</button>
      </Link>
    </div>
  );
};

export default ButtonGroup;
