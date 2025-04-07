// Components/GlobalAudioManager.js
import {useCustomStates} from "../CustomStates"
import bgMusic from "../assets/sounds/background.mp3";

export const GlobalAudioManager = () => {
  const { backgroundMusicRef } = useCustomStates();

  return (
    <audio
      ref={backgroundMusicRef}
      src={bgMusic}
      loop
      preload="auto"
      style={{ display: "none" }}
    />
  );
};
