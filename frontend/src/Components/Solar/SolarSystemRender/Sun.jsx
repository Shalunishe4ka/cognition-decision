import { Text } from "@react-three/drei";

export const Sun = ({ sunRef }) => {
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