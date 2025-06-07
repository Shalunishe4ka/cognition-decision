import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";

// Локальные карточки и стили
import { cards, cardcreds } from "./cards";
import "./ModalWindowCards.css";
import "./mobileVersion.css";

export const PlanetCardModal = ({ selectedPlanet, setSelectedPlanet }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Карточки берём напрямую из cards.js
  const currentCards = cards[selectedPlanet.name] || [];

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
              className="planet-image"
              alt="Planet img"
            />
            <div>
              <h1
                className="selected-planet-name"
                style={{ color: cardcreds[selectedPlanet.name].color }}
              >
                {selectedPlanet.name}
              </h1>
              <h3 className="life-strategy">
                <span
                  id="life-strategy-span"
                  style={{ color: cardcreds[selectedPlanet.name].color }}
                >
                  Стратегия жизни:
                </span>{" "}
                {selectedPlanet.description}
              </h3>
            </div>
          </div>
        </Modal.Title>
        <button
          className="close-cardList-modal-window"
          onClick={() => setSelectedPlanet(null)}
        >
          <CloseIcon
            fontSize="large"
            style={{ color: cardcreds[selectedPlanet.name].color }}
          />
        </button>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <div className="cards-container">
          {currentCards.map((card, index) => {
            const isActive = isZoomed && index === selectedCardIndex;
            return (
              <div
                key={card.uuid}
                className={`card-item ${isActive ? "card-item-zoomed" : "card-item-normal"}`}
              >
                <div className="card-wrapper">
                  <div className="card-header">
                    <p>{card.title}</p>
                    {isActive && (
                      <button className="close-card-modal-window">
                        <CloseIcon
                          fontSize="large"
                          style={{ color: cardcreds[selectedPlanet.name].color }}
                          onClick={handleZoomOut}
                        />
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <img
                      src={card.image}
                      alt={card.title}
                      className={isActive ? "card-img-zoomed" : "card-img"}
                    />
                    {isActive && (
                      <>
                        <div className="card-description">
                          <p>{card.description}</p>
                          <br />
                          <p style={{color: "rgb(255, 218, 150)"}}>Источник: </p>
                          <p>{card.paper}</p>
                          <a className="card-desc-link" id="card-desc-link" target="_blank" href={card.link}>Ссылка на статью</a>
                        </div>
                        <div className="card-footer">
                          <button
                            className="modal-cards-buttons choose-card-in-modal-window"
                            onClick={() => handleZoomWindow(index)}
                            style={{
                              borderColor: cardcreds[selectedPlanet.name].color,
                              cursor: "pointer",
                              width: "150px",
                              height: "40px"
                            }}
                          >
                            <Link
                              to={`/matrix_uuid/${card.uuid}`}
                              state={{ selectedPlanet }}
                              style={{
                                color: cardcreds[selectedPlanet.name].color,
                                fontSize: "1.5rem"
                              }}
                            >
                              Play
                            </Link>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="card-action">
                    {!isActive && (
                      <button
                        className="modal-cards-buttons choose-card-in-modal-window"
                        onClick={() => handleZoomWindow(index)}
                        style={{
                          color: cardcreds[selectedPlanet.name].color,
                          borderColor: cardcreds[selectedPlanet.name].color,
                          cursor: "pointer"
                        }}
                      >
                        Pick
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};
