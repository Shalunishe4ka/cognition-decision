import React, { useState, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ModalWindowCards.css";
import "./mobileVersion.css";

export const PlanetCardModal = ({ selectedPlanet, setSelectedPlanet }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Загрузка карточек из API
  useEffect(() => {
    if (!selectedPlanet) return;

    async function fetchCards() {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/cards/${selectedPlanet.name}`
        );
        setCards(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Ошибка загрузки карточек:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [selectedPlanet]);
  // Пока данные загружаются, показываем спиннер
  if (loading) {
    return (
      <div className="planet-card text-center" style={{ padding: "2rem" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
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
            <img />
            <h1>{selectedPlanet.name}</h1>
            <p>Стратегия жизни: {selectedPlanet.description}</p>
          </div>
        </Modal.Title>
        <button
          className="close-cardList-modal-window"
          onClick={() => setSelectedPlanet(null)}
        >
          <CloseIcon fontSize="large" />
        </button>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="cards-container">
          {cards.map((segment, index) => (
            <div
              key={segment.id}
              className={`card-item ${
                isZoomed && index === selectedCardIndex ? "zoomed" : ""
              }`}
            >
              <div className="card-header">
                <p>{segment.title}</p>
              </div>
              <div className="card-body">
                <img
                  src={segment.image_url}
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
