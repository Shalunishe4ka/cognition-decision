import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChallengeComponent.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";

const ChallengeComponent = ({ setHeaderShow }) => {
  setHeaderShow(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    // Ждем таймер, и если видео уже загружено, делаем его видимым
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
  }, [videoLoaded]);

  const handleVideoEnd = () => {
    navigate("/solar");
  };

  return (
    <main className="challengeContainer">
      <section className="heroSection">
        <div className="star-system">
          <div className="burningStar" />
          <svg className="constellationLine" viewBox="0 0 100 100">
            <line
              x1="-100"
              y1="100"
              x2="45"
              y2="20"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <line
              x1="45"
              y1="20"
              x2="75"
              y2="85"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="contentWrapper">
          <ChallengeYourMindText />
          <div className="second-page-texts">
            <h1 className="comabla">Coma Berenices</h1>
            {showText && (
              <Link to="/solar" className="letsGoText">
                Let's go!
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Видео рендерится всегда, но его видимость управляется через класс */}
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

