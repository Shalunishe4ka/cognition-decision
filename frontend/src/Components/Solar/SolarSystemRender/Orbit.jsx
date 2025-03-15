import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Orbit = ({ children, radius, speed }) => {
  const planetRef = useRef();

  // Обновляем позицию объекта по орбите
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const angle = elapsedTime * speed;
    if (planetRef.current) {
      planetRef.current.position.set(
        radius * Math.cos(angle),
        planetRef.current.position.y, // сохраняем текущую координату y
        radius * Math.sin(angle)
      );
    }
  });

  // Генерация точек окружности орбиты
  const points = Array.from({ length: 100 }, (_, i) => {
    const angle = (i / 100) * Math.PI * 2;
    return new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  });
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <>
      <lineLoop geometry={orbitGeometry}>
        <lineBasicMaterial attach="material" color="rgb(0,0,0)" />
      </lineLoop>
      <group ref={planetRef}>
        {React.isValidElement(children)
          ? React.cloneElement(children, { planetRef })
          : children}
      </group>
    </>
  );
};
