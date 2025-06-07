import React, { useState } from "react";
import { Link } from "react-router-dom";

export const SciencePageButtons = () => {


  return (
    <div className="SciencePageButtons-div">
      <button id="game-button">
        <a href="/solar">
          <p>Game</p>
        </a>
      </button>

    <Link to="/algorithm">
      <button id="algo-button">
          <h4>Algorithm</h4>
      </button>
      </Link>
    </div>
  );
};