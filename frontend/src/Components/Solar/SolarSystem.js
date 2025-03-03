import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, GodRays } from "@react-three/postprocessing";
import { OrbitControls, Stars } from "@react-three/drei";
import { PlanetCardModal } from "./ModalWindowCards/ModalWindowCards";
import "./SolarSystem.css"; // Import the CSS file for styling
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";
import CameraResetter from "./CameraResetter"
import { Scene } from "./SolarSystemRender.jsx/Scene";


const SolarSystem = () => {
  // eslint-disable-next-line
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const sunRef = useRef();

  // eslint-disable-next-line
  const handleHoverPlanet = setTimeout(() => {
    setHoveredPlanet("Orange");
  }, 250);


  return (
    <div className="solar-system">

      <div className="solar-challege-text-container">
        <ChallengeYourMindText />
        </div>

      <Canvas
        style={{ height: "100vh" }}
        camera={{ position: [35, 5, 25], fov: 70 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 4, 10]} />
        <Stars />
        <OrbitControls />
        <CameraResetter selectedPlanet={selectedPlanet} />
        <Scene
          sunRef={sunRef}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
        <EffectComposer>
          {sunRef.current && (
            <GodRays
              sun={sunRef.current}
              density={0.91}
              decay={0.9}
              weight={0.5}
              samples={60}
            />
          )}
        </EffectComposer>
      </Canvas>
      {selectedPlanet && (
        <PlanetCardModal
          selectedPlanet={selectedPlanet}
          setSelectedPlanet={setSelectedPlanet}
        />
      )}
    </div>
  );
};


export default SolarSystem;
