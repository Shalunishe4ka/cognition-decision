import React from "react";
import "./StartPage.css";
import "./StartPageAdaptives.css"
import ButtonGroup from "./ButtonGroup";
import { CognitionDecisionText } from "./CognitionDecisionText";
import { CODE } from "./CODE";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";

const StartPage = ({setHeaderShow}) => {
  setHeaderShow(true)
  return (
    <div className="start-page">
      <div className="content">
        <ChallengeYourMindText />
        <CODE />
        <CognitionDecisionText />
        <ButtonGroup />
      </div>
    </div>
  );
};

export default StartPage;
