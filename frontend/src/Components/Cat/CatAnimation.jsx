import React, { useState, useEffect } from "react";

// Используем require.context для импорта всех изображений
const importAll = (requireContext) => {
  return requireContext.keys().map(requireContext);
};

const frames = importAll(require.context("./frames", false, /\.png$/));

const CatAnimation = ({
  frameRate = 45,
  timeToCross = 20,
  triggerAnimation,
  onAnimationEnd,
  stopAtX = window.innerWidth * 0.7, // *** NEW *** по умолчанию 70% ширины экрана
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [xPosition, setXPosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Вычисляем скорость на основе времени прохождения экрана
  // (здесь можно оставить как было, либо тоже параметризовать)
  const moveSpeed = window.innerWidth / (timeToCross * frameRate);

  // При включении триггера начинаем анимацию
  useEffect(() => {
    if (triggerAnimation) {
      setIsRunning(true);
      setXPosition(100); // возвращаем кота на начальную позицию
    }
  }, [triggerAnimation]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
      setXPosition((prevX) => {
        const nextX = prevX + moveSpeed;

        // *** NEW ***
        // Если кот дошёл до заданного `stopAtX`, прекращаем анимацию
        if (nextX >= stopAtX) {
          clearInterval(interval);
          setIsRunning(false);

          if (onAnimationEnd) {
            onAnimationEnd();
          }
          return stopAtX; // "ставим" кота в конечную точку
        }

        return nextX;
      });
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isRunning, frameRate, moveSpeed, onAnimationEnd, stopAtX]);

  // Если анимация не идёт — не отображаем кота
  if (!isRunning) {
    return null;
  }

  return (
    <div style={styles.container}>
      <img
        src={frames[currentFrame]}
        alt={`Cat frame ${currentFrame + 1}`}
        style={{
          ...styles.image,
          transform: `translateX(${xPosition}px)`,
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "transparent",
    position: "absolute",
    top: "83%",
  },
  image: {
    width: "450px",
    height: "auto",
    position: "absolute",
    left: 0,
  },
};

export default CatAnimation;
