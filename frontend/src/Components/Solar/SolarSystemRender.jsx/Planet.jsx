import { Text } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";


export const Planet = ({
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
                viewVector: { type: "v3", value: camera.position },
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
            transparent: true,
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
                    <primitive object={createAtmosphereMaterial("#52ffbd")} />{" "}
                    {/* Light greenish-blue */}
                </mesh>
            )}
            {name === "Orange" && (
                <mesh>
                    <sphereGeometry args={[size * 1.1, 32, 32]} />
                    <primitive object={createAtmosphereMaterial("#ff8b2b")} />{" "}
                    {/* Light orange-yellow */}
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
