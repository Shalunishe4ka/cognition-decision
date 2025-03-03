import React, { useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, GodRays } from "@react-three/postprocessing";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { PlanetCard } from "./ModalWindowCards";
import "./styles.css"; // Import the CSS file for styling

const SolarSystem = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const sunRef = useRef();


 const handleHoverPlanet = setTimeout(() => {
    setHoveredPlanet('Orange')
  }, 100)

  console.log(handleHoverPlanet, hoveredPlanet); 


  useEffect(() => {
    const appHeader = document.querySelector(".App-header");
    if (selectedPlanet) {
      appHeader.style.display = "none";
    } else {
      appHeader.style.display = "flex";
    }
  }, [selectedPlanet]);

  return (
    <div className="solar-system">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "absolute",
          top: "120px",
          left: "35%",
          zIndex: 1,
        }}
      >
        <h1 className="text-block-solar">
          Challenge your mind
          <span style={{ fontFamily: "Reggae One, cursive" }}>!</span>
        </h1>
      </div>

      <Canvas style={{ height: "100vh" }} camera={{ position: [15, 5, 25], fov: 70 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 4, 10]} />
        <Stars />
        <OrbitControls />
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
        <PlanetCard
          selectedPlanet={selectedPlanet}
          setSelectedPlanet={setSelectedPlanet}
        />
      )}
    </div>
  );
};

const Scene = ({
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
          textureUrl="/imgs/craiyon_212148.png"

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
          textureUrl="/textures/img/Orange/TrueTextureOrange.jpg"
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
          textureUrl="/textures/img/Violet/41421.jpg"
          size={1.3}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
          selectedPlanet={selectedPlanet}
        />
      </Orbit>
    </>
  );
};

const Sun = ({ sunRef }) => {
  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial emissive={"#f5be76"} emissiveIntensity={7} />
      <Text position={[0, 5, 0]} fontSize={1.7} color="#ffffff">
        Al-Dafira
      </Text>
    </mesh>
  );
};

const Orbit = ({ children, radius, speed }) => {
  const planetRef = useRef();
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    planetRef.current.position.x = radius * Math.cos(elapsedTime * speed);
    planetRef.current.position.z = radius * Math.sin(elapsedTime * speed);
  });

  const points = [];
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * 2 * Math.PI;
    points.push(
      new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle))
    );
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <>
      <lineLoop geometry={orbitGeometry}>
        <lineBasicMaterial attach="material" color="rgba(0,0,0, 0.01)" />
      </lineLoop>
      <group ref={planetRef}>
        {React.cloneElement(children, { planetRef })}
      </group>
    </>
  );
};

const Planet = ({
  name,
  description,
  textureUrl,
  size,
  setHoveredPlanet,
  setSelectedPlanet,
  selectedPlanet,
  planetRef,
}) => {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const { camera } = useThree();

  useFrame(() => {
    if (selectedPlanet && selectedPlanet.name === name) {
      const planetPosition = planetRef.current.position;
      camera.position.lerp(
        new THREE.Vector3(
          planetPosition.x + size * 3,
          planetPosition.y + size * 2,
          planetPosition.z + size * 3
        ),
        0.1
      );
      camera.lookAt(planetPosition);
    }
  });

  const handleClick = () => {
    setSelectedPlanet({
      name,
      description,
      position: planetRef.current.position,
    });
  };

  const createAtmosphereMaterial = (glowColor) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { type: "f", value: 0.2 },
        p: { type: "f", value: 4.0 },
        glowColor: { type: "c", value: new THREE.Color(glowColor) },
        viewVector: { type: "v3", value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() 
        {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() 
        {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  };

  return (
    <group ref={planetRef}>
      <mesh
        onPointerOver={() => setHoveredPlanet(name)}
        onPointerOut={() => setHoveredPlanet(null)}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          emissiveIntensity={0.5}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {name === "Green" && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 32, 32]} />
          <primitive object={createAtmosphereMaterial("#52ffbd")} /> {/* Light greenish-blue */}
        </mesh>
      )}
      {name === "Orange" && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 32, 32]} />
          <primitive object={createAtmosphereMaterial("#ff8b2b")} /> {/* Light orange-yellow */}
        </mesh>
      )}
      {name === "Violet" && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 32, 32]} />
          <primitive object={createAtmosphereMaterial("#eea8ff")} /> 
        </mesh>
      )}
      <Text position={[0, 3.5, 0]} fontSize={1} color="#ffffff">
        {name}
      </Text>
    </group>
  );
};

export default SolarSystem;