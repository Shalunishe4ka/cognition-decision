import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { Orbit } from "./Orbit";

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
          textureUrl="https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Images/Planet%20Images/Green/Green%20Texture.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9JbWFnZXMvUGxhbmV0IEltYWdlcy9HcmVlbi9HcmVlbiBUZXh0dXJlLnBuZyIsImlhdCI6MTc0MTAyNjA3OCwiZXhwIjozMzE3ODI2MDc4fQ.2XB5UIpP4dUkm6wiyr5vQjjyolSexzvthz78x41XUkg"
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
          textureUrl="https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Images/Planet%20Images/Orange/Orange%20Texture.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9JbWFnZXMvUGxhbmV0IEltYWdlcy9PcmFuZ2UvT3JhbmdlIFRleHR1cmUuanBnIiwiaWF0IjoxNzQxMDI2MTQ4LCJleHAiOjMzMTc4MjYxNDh9.yN_Z-nhQAuCZ-lmAHPn2Xigvx289xjzQ0rYBUMfP8iY"
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
          textureUrl="https://wbtqmewzdckavymnlqjc.supabase.co/storage/v1/object/sign/Contents/Images/Planet%20Images/Violet/Violet%20Texture.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJDb250ZW50cy9JbWFnZXMvUGxhbmV0IEltYWdlcy9WaW9sZXQvVmlvbGV0IFRleHR1cmUuanBnIiwiaWF0IjoxNzQxMDI2MjIzLCJleHAiOjMzMTc4MjYyMjN9.gyS88qF0dhVii39IYJ6ORUkMAuUUKr3zgR3bZqpbuV4"
          size={1.3}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
    </>
  );
};