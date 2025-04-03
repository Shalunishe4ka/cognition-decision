import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, GodRays } from "@react-three/postprocessing";
import { OrbitControls, Stars } from "@react-three/drei";
import { PlanetCardModal } from "./ModalWindowCards/ModalWindowCards";
import "./SolarSystem.css";
import { ChallengeYourMindText } from "../ChallengeYourMindText/ChallengeYourMindText";
import CameraResetter from "./CameraResetter";
import { Scene } from "./SolarSystemRender/Scene";
import { useCustomStates } from "../../CustomStates";

const SolarSystem = ({ setHeaderShow }) => {
  
  useEffect(() => {
    setHeaderShow(false);
  }, [setHeaderShow]);

  const {
    setHoveredPlanet, selectedPlanet, setSelectedPlanet, hoveredPlanet
  } = useCustomStates();
  const sunRef = useRef();

  return (
    <div className="solar-system">
      <div className="solar-challege-text-container">
        <ChallengeYourMindText />
      </div>

      <Canvas
        style={{ height: "100vh" }}
        camera={{ position: [35, 5, 25], fov: 70 }}
        onCreated={({ gl }) => {
          // console.log("🎯 WebGL context initialized.");
        }}
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
          hoveredPlanet={hoveredPlanet}
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
