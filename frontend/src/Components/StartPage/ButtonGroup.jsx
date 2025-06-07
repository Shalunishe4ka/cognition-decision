import React from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";

const ButtonGroup = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token"); // ⬅️ Проверяем наличие токена

  const handlePlayClick = () => {
    if (token) {
      navigate("/challengecomponent");
    } else {
      navigate("/sign-in"); // ⬅️ Пинаем на логин, если токена нет
    }
  };

  const handleInfoClick = () => {
    navigate("/rules");
  };

  return (
    <div className="button-container">
      <button className="play-button" onClick={handlePlayClick}>
        Play
      </button>
      <button className="info-button" onClick={handleInfoClick}>
        Info
      </button>
    </div>
  );
};

export default ButtonGroup;
