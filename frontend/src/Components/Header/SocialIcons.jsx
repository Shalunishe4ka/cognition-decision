import React from "react";
import TelegramIcon from "@mui/icons-material/Telegram";
import GitHubIcon from "@mui/icons-material/GitHub";


const SocialIcons = () => {
  return (
    <div className="social-icons">
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        <GitHubIcon fontSize="large" />
      </a>
      <a href="https://t.me/cognition_decision_bot" target="_blank" rel="noopener noreferrer">
        <TelegramIcon fontSize="large" />
      </a>
    </div>
  );
};

export default SocialIcons;
