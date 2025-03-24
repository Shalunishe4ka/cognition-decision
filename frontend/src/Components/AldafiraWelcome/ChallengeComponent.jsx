import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ChallengeComponent.css";
import "./ChallengeComponentAdaptives.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";
import bg from "./assets/bg.png"
import intro from "./assets/premain.mp4"

const ChallengeComponent = ({ setHeaderShow }) => {
  useEffect(() => {
    setHeaderShow(false);
  }, [setHeaderShow]);
  const [showVideo, setShowVideo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    // Предзагрузка фонового изображения
    const backgroundImg = new Image();
    backgroundImg.src = bg;
    backgroundImg.onload = () => {
      setIsBackgroundLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!isBackgroundLoaded) return;

    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    const videoTimer = setTimeout(() => {
      if (videoLoaded) {
        setShowVideo(true);
        setShowText(false);
      }
    }, 4500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(videoTimer);
    };
  }, [videoLoaded, isBackgroundLoaded]);

  const handleVideoEnd = () => {
    navigate("/solar");
  };

  if (!isBackgroundLoaded) {
    return <div className="loadingScreen">Loading...</div>;
  }

  return (
    <main className="challengeContainer">
      <div className="heroSection">
        <div className="star-system">
          <div className="burningStar" />
          <svg className="constellationLine" viewBox="0 0 100 100">
            <line x1="-100" y1="100" x2="45" y2="20" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="45" y1="20" x2="75" y2="85" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="challenge-mind-text-div">
          <ChallengeYourMindText />
        </div>

        <div className="second-page-texts">
          <h1 className="comabla">Coma Berenices</h1>
          {showText && (
            <h1 onClick={handleVideoEnd} className="letsGoText">
              Let's go!
            </h1>
          )}
        </div>
      </div>


      <div className="videoOverlay">
        <video
          ref={videoRef}
          src={intro}
          preload="auto"
          className={`fullScreenVideo ${showVideo ? "visible" : "hidden"}`}
          onCanPlay={() => setVideoLoaded(true)}
          onEnded={handleVideoEnd}
          autoPlay
          muted
          playsInline
          webkit-playsinline="true"
        />
        {showVideo && (
          <button className="skipButton" onClick={handleVideoEnd}>
            Skip Video
          </button>
        )}
      </div>
    </main>
  );
};

export default ChallengeComponent;