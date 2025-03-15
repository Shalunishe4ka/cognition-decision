import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";
import { cards, cardcreds } from "./cards";
import "./ModalWindowCards.css";
import "./mobileVersion.css";

export const PlanetCardModal = ({ selectedPlanet, setSelectedPlanet }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null); // Хранилище для индексов
  const [isClosing, setIsClosing] = useState(false); // Для работы анимации
  const [isZoomed, setIsZoomed] = useState(false); // State for zoom effect


  const currentCards = cards[selectedPlanet.name];

  // Анимация зума для карточки
  const handleZoomWindow = (index) => {
    setIsZoomed(true);
    setTimeout(() => setSelectedCardIndex(index), 300);
  };

  const handleZoomOut = () => {
    setIsZoomed(false);
    setIsClosing(false);
    setTimeout(() => setSelectedCardIndex(null), 300);
  };

  const handleCardClick = (event) => {
    if (isZoomed) {
      event.stopPropagation(); // Prevent the click from propagating to the parent
    }
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
            <img src={cardcreds[selectedPlanet.name].src} className="planet-image" />
            <h1 className="selected-planet-name" style={{ color: cardcreds[selectedPlanet.name].color }}>{selectedPlanet.name}</h1>
            <p>Стратегия жизни: {selectedPlanet.description}</p>
          </div>
        </Modal.Title>
        <button
          className="close-cardList-modal-window"
          onClick={() => setSelectedPlanet(null)}
        >
          <CloseIcon fontSize="large" style={{ color: cardcreds[selectedPlanet.name].color }} />
        </button>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="cards-container">
          {currentCards.map((segment, index) => (
            <div
              key={segment.id}
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
                  // onClick={() => console.log(segment.image_url)}
                  >
                    Выбрать
                  </button>
                )}
                {isZoomed && index === selectedCardIndex && (
                  <button onClick={handleZoomOut}>Отмена</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};
