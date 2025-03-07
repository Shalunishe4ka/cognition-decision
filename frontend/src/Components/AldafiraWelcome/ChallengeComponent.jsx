import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChallengeComponent.css";
import "./ChallengeComponentAdaptives.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";


const ChallengeComponent = ({ setHeaderShow }) => {
  setHeaderShow(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    // Предзагрузка фонового изображения
    const backgroundImg = new Image();
    backgroundImg.src = "https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Images/2ndpage_bg.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9JbWFnZXMvMm5kcGFnZV9iZy5wbmciLCJpYXQiOjE3NDEwMjQ3MDYsImV4cCI6MzMxNzgyNDcwNn0.bVkxcIrKMbheXJpgPIyNtagGR0hQKwX1R9xXX4ofQRM";
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
            <Link to="/solar" className="letsGoText">
              Let's go!
            </Link>
          )}
        </div>
      </div>


      <div className="videoOverlay">
        <video
          ref={videoRef}
          src="https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Videos/Intro%20Video.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9WaWRlb3MvSW50cm8gVmlkZW8ubXA0IiwiaWF0IjoxNzQxMDI0ODYxLCJleHAiOjMzMTc4MjQ4NjF9.1X-HjKe4x6fvYhZJGa3ETM6wEgwBYuurHNPAXgv7CpQ"
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