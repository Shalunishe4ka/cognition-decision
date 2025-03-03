import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChallengeComponent.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";

const ChallengeComponent = ({ setHeaderShow }) => {
  setHeaderShow(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showText, setShowText] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    const videoTimer = setTimeout(() => {
      setShowVideo(true);
      setShowText(false);
    }, 4500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(videoTimer);
    };
  }, []);

  // Опционально: попытка перевести видео в полноэкранный режим
  useEffect(() => {
    if (showVideo && videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  }, [showVideo]);

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

      {showVideo && (
        <div className="videoOverlay">
          <video
            ref={videoRef}
            // src="premain.mp4"
            src="https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Videos/premain.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9WaWRlb3MvcHJlbWFpbi5tcDQiLCJpYXQiOjE3NDEwMTcxOTEsImV4cCI6MzMxNzgxNzE5MX0.HPJtYaidwA-GwRn84lc88HrWerfoI_jxmokW4zxEJdg"
            className="fullScreenVideo"
            onEnded={handleVideoEnd}
            autoPlay
            muted
            // playsInline
            webkit-playsinline="true"
          />
        </div>
      )}
    </main>
  );
};

export default ChallengeComponent;
