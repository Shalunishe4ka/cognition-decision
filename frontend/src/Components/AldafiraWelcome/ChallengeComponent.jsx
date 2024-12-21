import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChallengeComponent.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";

const ChallengeComponent = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [showText, setShowText] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    const videoTimer = setTimeout(() => {
      //   setShowVideo(true);
      //   setShowText(false);
    }, 4500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(videoTimer);
    };
  }, []);

  const handleVideoEnd = () => {
    // navigate("/solar");
  };

  return (
    <main className="challengeContainer">
      <section className="heroSection">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/60c36393ab5789e8bbbfdbcd4e0af221f7f9e604cca448a66ac1f2954b93d1b2?placeholderIfAbsent=true&apiKey=bb57d50f14b1477582a4d5db25b73723"
          className="backgroundImage"
          alt=""
        />

        <div className="burningStar"></div>

        <svg
          className="constellationLine"
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: "60px",
            left: "345px",
            width: "385px",
            height: "250px",
          }}
        >
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
            src="premain.mp4"
            className="fullScreenVideo"
            onEnded={handleVideoEnd}
            autoPlay
            muted
            playsInline
            controls
          />
        </div>
      )}
    </main>
  );
};

export default ChallengeComponent;
