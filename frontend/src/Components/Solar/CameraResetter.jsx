import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useEffect } from "react";

const CameraResetter = ({ selectedPlanet }) => {
  const { camera } = useThree();
  const initialPosition = new THREE.Vector3(35, 5, 25);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Запускаем сброс, когда планета снята
    if (selectedPlanet === null) {
      setIsResetting(true);
    }
  }, [selectedPlanet]);

  useFrame(() => {
    if (isResetting) {
      camera.position.lerpVectors(camera.position, initialPosition, 0.05);
      camera.lookAt(0, 0, 0);

      if (camera.position.distanceTo(initialPosition) < 0.1) {
        camera.position.copy(initialPosition);
        setIsResetting(false);
      }
    }
  });

  return null;
};

export default CameraResetter;
