import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";
import { cards, cardcreds } from "../cards";
import "./ModalWindowCards.css";
import "./mobileVersion.css"
// Кастомный хук для предзагрузки изображений
const useImagePreloader = (urls) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const total = urls.length;
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === total) setImagesLoaded(true);
      };
    });
  }, [urls]);

  return imagesLoaded;
};

export const PlanetCardModal = ({ selectedPlanet, setSelectedPlanet }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Данные для выбранной планеты
  const currentCards = cards[selectedPlanet.name];
  // Собираем URL-ы изображений для шапки и карточек
  const imageUrls = [
    cardcreds[selectedPlanet.name].src,
    ...currentCards.map((segment) => segment.image),
  ];
  const imagesLoaded = useImagePreloader(imageUrls);

  if (!imagesLoaded) {
    return (
      <div className="planet-card">
        <p>Загрузка...</p>
      </div>
    );
  }

  // Анимация зума для карточки
  const handleZoomWindow = (index) => {
    setIsZoomed(true);
    setTimeout(() => setSelectedCardIndex(index), 300);
  };

  const handleZoomOut = () => {
    setIsZoomed(false);
    setTimeout(() => setSelectedCardIndex(null), 300);
  };

  return (
    <Modal
      show={true}
      onHide={() => setSelectedPlanet(null)}
      centered
      dialogClassName="modal-dialog"
      contentClassName="modal-content-custom"
    >
      <Modal.Header className="modal-header-custom">
        <Modal.Title>
          <div className="modal-header-content">
            <img
              src={cardcreds[selectedPlanet.name].src}
              alt="planet"
              className="planet-image"
            />
            <div>
              <h1 className="planet-name-card-header" style={{ color: cardcreds[selectedPlanet.name].color }}>
                {cardcreds[selectedPlanet.name].name}
              </h1>
              <h5 className="planet-description-card-header">
                <span className="planet-description-card-header" style={{ color: cardcreds[selectedPlanet.name].color}}>
                  Стратегия жизни:
                </span>{" "}
                {cardcreds[selectedPlanet.name].desc}
              </h5>
            </div>
          </div>
        </Modal.Title>
        <button
          className="close-cardList-modal-window"
          style={{
            color: cardcreds[selectedPlanet.name].color,
            border: 'none',
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
          onClick={() => setSelectedPlanet(null)}
        >
          <CloseIcon fontSize="large" />
        </button>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="cards-container">
          {currentCards.map((segment, index) => (
            <div
              key={segment.index}
              className={`card-item ${isZoomed && index === selectedCardIndex ? "zoomed" : ""
                }`}
            >
              <div className="card-header">
                <p>{segment.title}</p>
              </div>
              <div className="card-body">
                <img
                  src={segment.image}
                  alt={segment.title}
                  width={isZoomed && index === selectedCardIndex ? 250 : 180}
                  height={isZoomed && index === selectedCardIndex ? 250 : 180}
                  onClick={() =>
                    isZoomed && index === selectedCardIndex
                      ? handleZoomOut()
                      : null
                  }
                />
                {isZoomed && index === selectedCardIndex && (
                  <>
                    <div className="card-description">
                      <p>{segment.description}</p>
                    </div>
                    <div className="card-footer">
                      <Link
                        to={`/matrix/${selectedCardIndex + 1}`}
                        state={{ selectedPlanet, selectedCardIndex }}
                      >
                        Играть
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <div className="card-action">
                {!isZoomed && (
                  <button
                    className="modal-cards-buttons choose-card-in-modal-window"
                    onClick={() => handleZoomWindow(index)}
                    style={{
                      color: cardcreds[selectedPlanet.name].color, border: `3px solid ${cardcreds[selectedPlanet.name].color}`,

                    }}
                  >
                    Выбрать
                  </button>
                )}
                {isZoomed && index === selectedCardIndex && (
                  <button onClick={handleZoomOut}>
                    Отмена
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};
