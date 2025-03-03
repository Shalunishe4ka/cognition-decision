import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useEffect } from "react";

const CameraResetter = ({ triggerReset, onResetComplete }) => {
  const { camera } = useThree();
  const initialPosition = new THREE.Vector3(35, 5, 25);
  const [isResetting, setIsResetting] = useState(false);

  // При получении triggerReset = true запускаем анимацию сброса
  useEffect(() => {
    if (triggerReset) {
      setIsResetting(true);
    }
  }, [triggerReset]);

  useFrame((state, delta) => {
    if (isResetting) {
      camera.position.lerp(initialPosition, delta * 1.5);
      camera.lookAt(0, 0, 0);
      // Если камера достаточно близко к исходной позиции, останавливаем анимацию
      if (camera.position.distanceTo(initialPosition) < 0.1) {
        camera.position.copy(initialPosition);
        setIsResetting(false);
        if (onResetComplete) {
          onResetComplete();
        }
      }
    }
  });

  return null;
};

export default CameraResetter;
