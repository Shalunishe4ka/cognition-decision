import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { Orbit } from "./Orbit";
import GreenPlanetImg from "./assets/imgs/Green/"
export const Scene = ({
  sunRef,
  setHoveredPlanet,
  setSelectedPlanet,
  selectedPlanet,
}) => {
  return (
    <>
      <Sun sunRef={sunRef} />

      <Orbit radius={12} speed={0.3}>
        <Planet
          name="Green"
          description="Жители планеты Green приняли всеобъемлющую стратегию сбережения ее природных ресурсов и жизни в окружении природы. Обеспечение качества среды обитания занимают первостепенное значение в принятии решений."
          textureUrl=""
          size={1}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
      <Orbit radius={18} speed={-0.05}>
        <Planet
          name="Orange"
          description="Жители планеты Orange строят совершенное общественное устройство. Баланс социальных факторов определяет процветание нации. Настройка институционального комплекса во всех сферах жизни людей является первостепенной задачей."
          textureUrl=""
          size={1.1}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
      <Orbit radius={28} speed={0.05}>
        <Planet
          name="Violet"
          description="Жители планеты Violet сосредоточены на обеспечении устойчивого жизнеобеспечения, надежности и безопасности всех индустриальных и социально-экономических систем, развивающихся на планете. Предпочитают сберегающие методы, оказывающих положительное воздействие на окружающую среду, животных и людей."
          textureUrl=""
          size={1.3}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
    </>
  );
};