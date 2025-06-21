import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { Orbit } from "./Orbit";
import GreenPlanetTexture from "./assets/imgs/Green/GreenPlanetTexture.png";
import OrangePlanetTexture from "./assets/imgs/Orange/OrangePlanetTexture.jpg";
import VioletPlanetTexture from "./assets/imgs/Violet/VioletPlanetTexture.jpg";
import { useEffect } from "react";

export const Scene = ({
  sunRef,
  setHoveredPlanet,
  setSelectedPlanet,
  selectedPlanet,
  hoveredPlanet
}) => {

  useEffect(() => {
    setHoveredPlanet("Orange");
    // console.log("Hovered Planet changed:", hoveredPlanet);
    // eslint-disable-next-line
  }, [setHoveredPlanet]);

  return (
    <>
      <Sun sunRef={sunRef} />

      <Orbit radius={12} speed={0.3}>
        <Planet
          name="Green"
          description="The inhabitants of planet Green have adopted a comprehensive strategy for conserving its natural resources and living enveloped by nature. Ensuring habitat quality is of paramount importance in their decision-making."
          textureUrl={GreenPlanetTexture}
          size={1}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>

      <Orbit radius={18} speed={-0.05}>
        <Planet
          name="Orange"
          description="The inhabitants of planet Orange are building an ideal societal system. Balancing social factors determines the nation’s prosperity. Configuring the institutional framework across all aspects of life is their primary task."
          textureUrl={OrangePlanetTexture}
          size={1.1}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>

      <Orbit radius={28} speed={0.05}>
        <Planet
          name="Violet"
          description="The inhabitants of planet Violet focus on ensuring sustainable livelihoods, reliability, and safety of all industrial and socio-economic systems on the planet. They prefer conservation-oriented methods that have a positive impact on the environment, animals, and people."
          textureUrl={VioletPlanetTexture}
          size={1.3}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
    </>
  );
};
